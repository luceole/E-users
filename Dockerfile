# Conteneur E-User  en mode Production
# Le repertoire "dist" doit être  créé avant par : gulp build
FROM mhart/alpine-node:8
RUN apk add --no-cache make g++  python  ;npm install -g node-gyp
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
ADD ./dist/package.json .
ENV NODE_ENV production
RUN npm install --production
RUN apk del  make  g++  python
ADD ./dist  /usr/src/app
CMD [ "npm", "start" ]
