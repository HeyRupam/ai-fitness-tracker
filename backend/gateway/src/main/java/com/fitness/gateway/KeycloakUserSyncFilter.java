package com.fitness.gateway;

import com.fitness.gateway.user.UserService;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;
import com.fitness.gateway.user.ResgisterRequest;

@Component
@Slf4j
@RequiredArgsConstructor
public class KeycloakUserSyncFilter implements WebFilter {
    private final UserService userService;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain){
        String token = exchange.getRequest().getHeaders().getFirst("Authorization");
        ResgisterRequest registerRequest = getUserDetails(token);

        // Always derive the user id from the (already validated) JWT. Never trust a client-supplied
        // X-User-ID header, otherwise any logged-in user could act as another user.
        String userId = registerRequest != null ? registerRequest.getKeycloakId() : null;

        if(userId != null){
            String finalUserId = userId;
            return userService.validateUser(userId)
                    .flatMap(exist ->{
                        if(!exist){
                            if(registerRequest != null){
                                return userService.registerUser(registerRequest)
                                        .then(Mono.empty());
                            }
                            return Mono.empty();
                        }
                        else {
                            log.info("User {} exists in User Service", finalUserId);
                            return Mono.empty();
                        }
                    })
                    .then(Mono.defer(() -> {
                        ServerHttpRequest mutatedRequest = exchange.getRequest().mutate()
                                .headers(headers -> headers.set("X-User-ID", finalUserId))
                                .build();
                        return chain.filter(exchange.mutate().request(mutatedRequest).build());
                    }));
        }
        return chain.filter(exchange);
    }

    private ResgisterRequest getUserDetails(String token) {
        if (token == null || !token.startsWith("Bearer ")) {
            return null;
        }
        try{
            String tokenWithoutBearer = token.replace("Bearer ", "").trim();
            SignedJWT jwt = SignedJWT.parse(tokenWithoutBearer);
            JWTClaimsSet claims = jwt.getJWTClaimsSet();

            ResgisterRequest resgisterRequest = new ResgisterRequest();
            resgisterRequest.setEmail(claims.getStringClaim("email"));
            resgisterRequest.setKeycloakId(claims.getStringClaim("sub"));
            resgisterRequest.setPassword("Pasword@123"); // Default password, should be changed later
            resgisterRequest.setFirstName(claims.getStringClaim("given_name"));
            resgisterRequest.setLastName(claims.getStringClaim("family_name"));

            return resgisterRequest;
        }catch (Exception e){
            log.warn("Could not parse JWT from Authorization header: {}", e.getMessage());
            return null;
        }
    }
}
