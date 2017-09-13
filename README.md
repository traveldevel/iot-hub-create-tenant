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

    1. Deploy mongo-express to admin MongoDB in Cloud Foundry 
    
    2. Clone the repo : `https://github.com/traveldevel/mongo-express.git`
    
    3. Edit the `.env` file with your Mongo service manual connection and other parameters if not working to read from VCAP_SERVICES
    
    4. Edit the `manifest.yml` file and change service related info
    
    5. Run `cf login`, `cf push` open the link, you should see the UI
