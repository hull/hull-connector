# <%=packageHumanName%>

### Installing:

```sh
> git clone git@github.com/<%= packageGitHubOrg %>/<%= packageName %>.git;
> cd event-attribution;
```

### Booting

```sh
> yarn # (or npm i)
> yarn dev # (or npm run dev)
```

### Developing:

```sh
> yarn dev
# {"port":8082,"level":"info","message":"connector.server.listen"}

# In a new shell:
> yarn ngrok
# listening on https://<%=packageName%>.eu.ngrok.io
# Go to your dashboard, and add this connector.
```

### Testing

```sh
> yarn test
# or
> yarn test:watch # to keep it watching.
```

### Deploying

* Anywhere node.js is supported.

* Or in 1 click with:

[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy?template=https://github.com/<%= packageGitHubOrg %>/<%= packageName %>)
