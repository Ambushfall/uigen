Run package.json script from $ARGUMENTS using "bun"

Do not redirect output.

example:
- /scripts dev [Input] (Becomes bun run dev)
- /scripts start [Input] (becomes bun run start)


If the script called instantiates a server on a URL, open the browser and navigate to that URL using playwright.