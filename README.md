# iot-hub-create-tenant

0. Clone this repository width a Git GUI or `git clone`

00. Set CF environment api url with `cf api <URL>`

000. Login to CF environment with `cf login`


1. Create if not exists the landscape Mongo db (as service) and bind to app
    
    `cf create-service mongodb v3.0-dev mongo_<LANDSCAPE_NAME>`

2. Edit `manifest.yml` and change `landscapeName`, `tenantName` and `services` (name of service instance created)

3. Run to create the tenant collections and initialize them

    `npm start` or `node index.js` in current directory
