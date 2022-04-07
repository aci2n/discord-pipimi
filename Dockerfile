FROM node:17-alpine
WORKDIR /pipimi
COPY ["package.json", "package-lock.json", "./"]
RUN npm install
COPY ["src", "./src"]
CMD ["npm", "start"]