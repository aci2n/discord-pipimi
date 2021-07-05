FROM node:16-alpine
WORKDIR /pipimi
COPY ["package.json", "package-lock.json", "./"]
RUN npm install
COPY ["ml-embed.js", "ml-fetch.js", "pipimi.js", "./"]
CMD ["npm", "start"]