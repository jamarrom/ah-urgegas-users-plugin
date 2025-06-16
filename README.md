# Actionhero: Users Plugin.

ActionHero plugin for users for contributing MongoDB and Mongoose.

- Running the tests on this plugin require a MongoDB instance configured in localhost:27017
- The easiest way to get that is to simply use docker:

  ```bash
  docker run --name mongo_container --publish 27017:27017 -d mongo:4.0.13-xenial
  ```

- Remember to stop and remove your container when done:

  ```bash
  docker container stop mongo_container
  docker container rm mongo_container
  ```

- See mongo images in docker hub for more info: https://hub.docker.com/_/mongo/

# Test

```bash
npx jest
```

# Generate documentation usin JSDoc

- Install JSDoc if you don't have it.
  ```bash
  npm install -g jsdoc
  ```
- Generate docs usign the comments into the code.
  ```bash
  npm run generate-docs
  ```
- Now if you run the project, you can view all the documentation of this plugin in [localhost:8080](http:localhost:8080) or more specific into [localhost:8080/docs](http:localhost:8080/docs) on your browser.

# Create a new release to npm

1. First, upgrade the version into _package.json_ file at version field.

2. Commit and merge into master branch. **Only if the version is stable.**

   ```bash
   git add . && git commit -m "New release description."
   git checkout master
   git merge dev
   ```

3. Create a tag on the current version.

   ```bash
   git tag -a vX.X.X -m "My stable version X.X.X"
   ```

4. Push changes and tags into remote origin.

    ```bash
    git push origin master && git push --follow-tags
    ```

5. Configure a new release on gitlab on [tags section](https://gitlab.com/urge-gas/ah-urgegas-users-plugin/-/tags).

6. Checkout to the release.

    ```bash
    git chekout tags/vX.X.X
    ```
6. If you're not logged, login to npm.

    ```bash
    npm login
    ```

    Now, you can publish the Users Plugin to [npm](https://www.npmjs.com/package/@tubrody/ah-urgegas-users-plugin). By default this action make the npm updates private.

    ```bash
    npm publish
    ```

7. Finally, you can use the ah-users-plugin (logged with an account with acces to the npm repository)
    ```bash
    npm install @tubrody/ah-urgegas-users-plugin
    ```

    On actionhero base project:
    *config/plugins.js*
    ```
    return {
      "ah-users-plugin": {
        path: __dirname + "/../node_modules/@tubrody/ah-urgegas-users-plugin"
      }
    };
    ```
