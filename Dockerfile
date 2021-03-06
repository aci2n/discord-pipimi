FROM node:18-alpine

# RUN apt update
# RUN apt install -y python3 python3-pip
# RUN pip3 install easyocr
# RUN pip3 install manga-ocr

WORKDIR /pipimi

COPY ["package.json", "package-lock.json", "./"]
RUN npm ci

COPY ["src", "./src"]

CMD ["npm", "start"]