import { env } from "./config/env"
import { createApp } from "./app"

const app = createApp()

app.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(
    `HydroNexus backend listening on http://localhost:${env.port}/api/v1 (${env.nodeEnv})`,
  )
})
