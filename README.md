# E-USERS

Group Work App: Manage Users, Groups, Meetings, and Polls

 - Access to :

      - Forum (Discourse )
      - Collaborative text editor (EtherPad)
      - Collaborative spreadsheet (Ethercal)
      - Notes Text(ckeditor)
      - ...


## Getting Started

Docker :

https://hub.docker.com/r/luceole/e-user-prod/

### Prerequisites

- [Git](https://git-scm.com/)
- [Node.js and npm](nodejs.org) Node >= 8.x.x, npm >= 6.x.x
- [Yarn](https://yarnpkg.com)  
- [Gulp](http://gulpjs.com/) (`npm install --global gulp`)
- [MongoDB](https://www.mongodb.org/) - Keep a running daemon with `mongod`

### Developing

1. Run `yarn install` to install server dependencies.

2. Run `mongod` in a separate shell to keep an instance of the MongoDB Daemon running

3. Run `gulp go` to start the development server. It should automatically open the client in your browser when ready.

## Build & development

Run `gulp build` for building and `gulp serve` for preview.
