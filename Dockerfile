# Conteneur E-User  en mode Production
# Le repertoire "dist" doit être  créé avant par : gulp build
FROM mhart/alpine-node:6
RUN apk add --no-cache make gcc g++  python
RUN npm install -g node-gyp
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY ./dist  /usr/src/app
ENV NODE_ENV production
RUN npm install --production
CMD [ "npm", "start" ]
