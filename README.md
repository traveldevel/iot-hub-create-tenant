# iot-hub-create-tenant

## 0. Get files and login to CF environment

    Clone this repository width a Git GUI or `git clone`

    Set CF environment api url with `cf api <URL>`

    Login to CF environment with `cf login`


## 1. Create if not exists the landscape Mongo db (as service) and bind to app
    
    `cf create-service mongodb v3.0-dev mongo_<LANDSCAPE_NAME>`

## 2. Edit `manifest.yml`

    Change `landscapeName`, `tenantName` and `services` (name of service instance created)

## 3. Run to create the tenant collections and initialize them

    `npm start` or `node index.js` in current directory
    
## 4. Connect to Mongo and check the tenant collections

    https://github.com/komushi/cf-mongo-express
