# Install

```shell
npm i create-cloudflare
```

# Deploy

## Cloudflare setup

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

## Zoom app

### Zoom app

https://marketplace.zoom.us/

General app -> User managed

- Basic Information
    - OAuth redirect: The app that's running the authentication
        - e.g. https://github.com/zoom/zoomapps-texteditor-vuejs
    - Oauth allow lists
        - same as oauth redirect
- Access:
    - Nothing?
- Surface:
    - Home URL: url to navigate to after oauth is successful (i.e. this site)
    - Domain Allow list:
        - home url
        - oauth redirect
        - appssdk.zoom.us
    - Where to use your app?
        - Meetings
    - In-client app features
        - Zoom App SDK (enable)
            - Zoom app apis required to be enabled are listed in `src/components/zoomapps/ZoomApps.vue`
        - Guest Mode (disable)
        - In client OAuth (enable)
        - Collaborate mode (disable)
- Embed
    - Disable everything
- Connect
    - Leave as is (empty)
- Scopes
    - meeting:write
    - meeting:read
    - user:read
    - zoomapp:inmeeting
- Actions
    - Leave as it (empty)


Note: for firefox you need to increase setting for CSP headers to come through (`about:config`)

`network.http.max_response_header_size = 1000000` seems to work fine

## Zoom fleet feature / Zoom Meeting SDK

https://developers.zoom.us/docs/meeting-sdk/get-credentials/

# TODO

## Code

Save names to local storage

fix colors

## Nice to have

Convert to Dijkstra algorithm when grouping in participant finder
Timezone converter (with the slidey thing)
Language support
