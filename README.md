## Required for building
* Required package for pip install: libpq-dev; python-dev

## Deploy Frontend
You need to mount the file   [`env.js`](frontend/public/environment/env.js) in the folder `/app/build/environment` in order for the frontend to work. Customize the values as needed

## Backend Environment Variables
* `COOKIE_EXPIRE_TIME`
  * Hours that login cookies are stored
* `DOMAIN`
  * Domain under which the application runs
* `DEBUG`
  * If set a developent server is used for more debug info
* `DB_CONNECTION`
  * Path to sqlite file or connection string for postress etc.
* `ADMIN_USERNAME`
  * Username of admin user
* `ADMIN_PASSWORD`
  * Password of admin user
* `MOD_USERNAME`
  * Username of moderator
* `MOD_PASSWORD`
  * Password of moderator
* `USER_PASSWORD`
  * Password that will be assigned on import from old Drinklist
* `UNDO_TIMELIMIT`
  * The time a user can undo transactions in minutes

### Importing from old Drinklist
* `X_AUTH_TOKEN`
  * If you need to import data from an old drinklist provide an admin api token and this drinklist will fetch all data from the old drinklist
* `OLD_DOMAIN`
  * If you need to import data from an old drinklist provide the domain under which the drinklist is hosted

## Used Colors
* #041C32
* #04293A
* #064663
* #ECB365
