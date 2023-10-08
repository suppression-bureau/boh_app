import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App.tsx"
import { Provider, createClient, fetchExchange } from "urql"

const client = createClient({
    url: "http://localhost:8000/graphql",
    suspense: true,
    exchanges: [fetchExchange],
})

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <Provider value={client}>
            <App />
        </Provider>
    </React.StrictMode>,
)
