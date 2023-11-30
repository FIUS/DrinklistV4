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
  * Defaults to: `false`
* `DB_CONNECTION`
  * Path to sqlite file or connection string for postress etc.
  * Defaults to: `sqlite:///db/database.db`
  * Note the sqlite file is relative to the `instance` directory, meaning the actual path of the database file starts with `instance/.../*.db`
    * The default path is therefore `instance/db/database.db` (inside docker container `/usr/src/app/instance/db/database.db`)
* `ADMIN_USERNAME`
  * Username of admin user
  * Ignored after building database for the first time
  * Defaults to: `admin`
* `ADMIN_PASSWORD`
  * Password of admin user
  * Ignored after building database for the first time
  * Defaults to: `unsafe`
* `MOD_USERNAME`
  * Username of moderator
  * Ignored after building database for the first time
  * Defaults to: `moderator`
* `MOD_PASSWORD`
  * Password of moderator
  * Ignored after building database for the first time
  * Defaults to: `unsafe`
* `USER_PASSWORD`
  * Password that will be assigned on import from old Drinklist
  * Defaults to: `unsafe`
* `UNDO_TIMELIMIT`
  * The time a user can undo transactions in minutes
  * Defaults to: `1`
* `DEFAULT_DRINK_CATEGORY`
  * The category name of drinks for which no category is provided
  * Defaults to: `Getränk`
* `USE_ALIAS`
  * If aliases should be displayed. Disabling this feature **will not** delete the aliases. If reenabled the previously used aliases will be displayed again
  * Defaults to: `true`
* `AUTO_HIDE_DAYS`
  * Days after which a user is automatically hidden if he has not bought any drinks in this time
  * Feature is disabled if set to `None` (disabled per default)
  * Defaults to: `None`
* `PASSSWORD_HASH_ROUNDS`
  * Number of hash rounds for pbkdf2_hmac.
  * Minimum is 10 000. It is recommended to use at least 100 000
  
### Email environment variables
* `MAIL_SERVER`
  * The mail server address to use for sending mails
  * Mail feature is disabled if set to `None` (disabled per default)
  * Defaults to: `None`
* `MAIL_PORT`
  * The port of the mail server
  * Defaults to: 587
* `MAIL_EMAIL`
  * The email address to use for sending mails
  * Defaults to: `None`
* `MAIL_USERNAME`
  * The username to use for sending mails
  * Defaults to: `None`
* `MAIL_PASSWORD`
  * The password to use for sending mails
  * Defaults to: `None`
* `MAIL_POSTFIX`
  * If the username does not contain `@` characters this postfix (plus `@` character) is appended to the username and used to construct the email address
  * Defaults to: `None`

### OpenID Connect environment variables
* `OIDC_CLIENT_ID`
  * The client id of the openid connect client
  * Defaults to: `None`
* `OIDC_CLIENT_SECRET`
  * The secret of the openid connect client
  * Defaults to: `None`
* `OIDC_REDIRECT_MAIN_PAGE`
  * The domain on which the drinklist is hosten **including `http(s)://`**
  * Defaults to: `http://127.0.0.1:3000`
* `OIDC_AUTH_PATH`
  * The url where the login redirects to e.g. `<server>/oauth2/auth`
  * Defaults to: `None`
* `OIDC_AUTH_TOKEN`
  * The url where the token is retreived to e.g. `<server>/oauth2/token`
  * Defaults to: `None`
* `OIDC_AUTH_REDIRECT`
  * The url of the backend where the login provider sends the data to
  * Defaults to: `http://127.0.0.1:5000/api/oidc-redirect`
* `OIDC_USER_INFO`
  * The url under which the backend can retreive the information of the user with the token
  * Defaults to: `None`
* `OIDC_USER_NEEDS_VERIFICATION`
  * Flag if users need to be activated by an admin when using openid connect for the first time
  * Defaults to: `true`

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
