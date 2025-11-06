FROM node:25-alpine AS build-stage

# set working directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH=/app/node_modules/.bin:$PATH

# install app dependencies
COPY package.json ./
COPY package-lock.json ./
RUN npm install

# add app
COPY . ./
RUN rm public/environment/env.js

RUN npm run build 

FROM node:25-alpine AS production-stage
WORKDIR /app
COPY --from=build-stage /app/build /app/build
RUN npm install -g serve

# start app
CMD ["serve", "-s", "build", "-l", "80"]
