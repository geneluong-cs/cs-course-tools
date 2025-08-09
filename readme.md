# Install

```shell
npm i create-cloudflare
```

# CI/CD setup

https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/

- Create token
- Use `Edit Cloudflare Workers` template
- Permission whitelist
    - workers kv storage (delete)
    - workers script (edit)
    - workers routes (delete)
    - account settings (read)
    - user details (read)
    - workers tail (delete)
    - workers r2 storage (delete)
    - cloud flare pages (delete)
    - workers build configuration (delete)
    - workers agent configuration (delete)
    - memberships (read)
    - workers observability (delete)
- Account resources -> include your own account
- Zone resources -> all zones from an account -> your own account
- Client ip address filtering -> leave as is
- TTL -> whatever you want

# TODO

## Code

Save names to local storage

fix colors

## Nice to have

Convert to Dijkstra algorithm when grouping in participant finder
Timezone converter (with the slidey thing)
Language support
Auto Grouping participants in class
