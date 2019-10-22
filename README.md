[![CircleCI](https://circleci.com/gh/Eoic/netbots.svg?style=svg&circle-token=00241a178411177fbd19a453a58680be0aab2449)](https://circleci.com/gh/Eoic/netbots)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/ef89c5dc37fa4749924f05a9e9c0c9ca)](https://www.codacy.com?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=Eoic/netbots&amp;utm_campaign=Badge_Grade)
[![Maintainability](https://api.codeclimate.com/v1/badges/c095c15457bb52bc3895/maintainability)](https://codeclimate.com/github/Eoic/netbots/maintainability)
# NETBOTS - multiplayer robot programming game

## Installing

Step 1: Install [NodeJS](https://nodejs.org/en/)

Step 2: Install `nodemon` by typing `npm install -g nodemon`

Step 3: Install node modules by typing `npm install`

Step 4: Install [MongoDB](https://www.mongodb.com/) and create new database. Change `mongoURI` field in `config.js` file to your mongo connection string

Step 5: Copy and rename `.example.env` file to `.env` and edit its configuration

Step 5: Start project with `npm start`

Step 6: Open project in the browser: [http://localhost:3000](http://localhost:3000)

## NPM scripts

`start` - starts production server

`dev` - starts watching SCSS and TypeScript files and launches development server

`lint` - lint TypeScript source files

`scss-watch` - watch SCSS files and transpile to CSS in `out` directory for development

`scss-build` - transpile SCSS to CSS to `dist` directory

`scss-build-dev` - transpile SCSS to CSS to `out` directory once

`ts-watch` - watch TypeScript source files and output JavaScript to `out` directory

`ts-build` - transpile TypeScript source files to `dist` directory

`build` - build project
