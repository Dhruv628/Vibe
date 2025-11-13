# You can use most Debian-based base images
FROM node:25-slim

# Install curl
RUN apt-get update && apt-get install -y curl && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY compile_page.sh /compile_page.sh
COPY polyfill.js /polyfill.js
COPY layout.tsx /layout.tsx
RUN chmod +x /compile_page.sh

# Install dependencies and customize sandbox
WORKDIR /home/user/nextjs-app

RUN npx --yes create-next-app@15.3.3 . --yes

# Copy our localStorage polyfill
RUN cp /polyfill.js /home/user/nextjs-app/localStorage-polyfill.js

# Replace the layout.tsx with our polyfilled version
RUN cp /layout.tsx /home/user/nextjs-app/app/layout.tsx

# Modify package.json to preload our polyfill
RUN sed -i 's/"dev": "next dev"/"dev": "node --require .\/localStorage-polyfill.js node_modules\/next\/dist\/bin\/next dev"/' /home/user/nextjs-app/package.json
RUN sed -i 's/"build": "next build"/"build": "node --require .\/localStorage-polyfill.js node_modules\/next\/dist\/bin\/next build"/' /home/user/nextjs-app/package.json
RUN sed -i 's/"start": "next start"/"start": "node --require .\/localStorage-polyfill.js node_modules\/next\/dist\/bin\/next start"/' /home/user/nextjs-app/package.json

RUN npx --yes shadcn@2.6.3 init --yes -b neutral --force
RUN npx --yes shadcn@2.6.3 add --all --yes

# Move the Nextjs app to the home directory and remove the nextjs-app directory
RUN mv /home/user/nextjs-app/* /home/user/ && rm -rf /home/user/nextjs-app
