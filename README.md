## Required for building
* Required package for pip install: libpq-dev; python-dev

## Deploy Frontend
You need to mount the file   [`env.js`](frontend/public/environment/env.js) in the folder `/app/build/environment` in order for the frontend to work. Customize the values as needed

## Backend Environment Variables
* `COOKIE_EXPIRE_TIME`
  * Hours that login cookies are stored
  * Defaults to: `60**3`
* `DOMAIN`
  * Domain under which the application runs
  * Defaults to: `127.0.0.1:3000`
* `DEBUG`
  * If set a developent server is used for more debug info
  * Defaults to: `False`
* `DB_CONNECTION`
  * Path to sqlite file or connection string for postress etc.
  * Defaults to: `sqlite:///database.db`
* `ADMIN_USERNAME`
  * Username of admin user
  * Defaults to: `admin`
* `ADMIN_PASSWORD`
  * Password of admin user
  * Defaults to: `unsafe`
* `MOD_USERNAME`
  * Username of moderator
  * Defaults to: `moderator`
* `MOD_PASSWORD`
  * Password of moderator
  * Defaults to: `unsafe`
* `USER_PASSWORD`
  * Password that will be assigned on import from old Drinklist
  * Defaults to: `unsafe`
* `UNDO_TIMELIMIT`
  * The time a user can undo transactions in minutes
  * Defaults to: `1`
* `DEFAULT_DRINK_CATEGORY`
  * The category name of drinks for which no category is provided


### Importing from old Drinklist
* `X_AUTH_TOKEN`
  * If you need to import data from an old drinklist provide an admin api token and this drinklist will fetch all data from the old drinklist
  * Defaults to: `None`
* `OLD_DOMAIN`
  * If you need to import data from an old drinklist provide the domain under which the drinklist is hosted
  * Defaults to: `None`

## Used Colors
* #041C32
* #04293A
* #064663
* #ECB365
