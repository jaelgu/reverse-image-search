FROM node:16-alpine3.14 as builder
WORKDIR /app
ENV NEXT_PUBLIC_BASE_API_URL http://172.16.20.41:5000/

COPY . .
RUN yarn
RUN yarn build

# => Run container
FROM nginx:1.17-alpine

# Nginx config
RUN rm -rf /etc/nginx/conf.d
COPY conf /etc/nginx

# Static build
COPY --from=builder /app/out /usr/share/nginx/html/

# Default port exposure
EXPOSE 80

# Add bash
RUN apk add --no-cache bash

# Start Nginx server
CMD ["/bin/bash", "-c", "nginx -g \"daemon off;\""]
