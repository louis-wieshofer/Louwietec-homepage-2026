# Stage 1: Build Tailwind CSS
FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npx tailwindcss -i src/input.css -o css/output.css --minify

# Stage 2: Serve with Nginx
FROM nginx:alpine

COPY --from=builder /app/index.html /usr/share/nginx/html/
COPY --from=builder /app/about.html /usr/share/nginx/html/
COPY --from=builder /app/approach.html /usr/share/nginx/html/
COPY --from=builder /app/principles.html /usr/share/nginx/html/
COPY --from=builder /app/contact.html /usr/share/nginx/html/
COPY --from=builder /app/impressum.html /usr/share/nginx/html/
COPY --from=builder /app/css/ /usr/share/nginx/html/css/
COPY --from=builder /app/js/ /usr/share/nginx/html/js/
COPY --from=builder /app/assets/ /usr/share/nginx/html/assets/
COPY --from=builder /app/robots.txt /usr/share/nginx/html/
COPY --from=builder /app/sitemap.xml /usr/share/nginx/html/
COPY --from=builder /app/humans.txt /usr/share/nginx/html/
COPY --from=builder /app/site.webmanifest /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
