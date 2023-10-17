import { useQuery } from "urql"

import Box from "@mui/material/Box"
import Card from "@mui/material/Card"
import CardHeader from "@mui/material/CardHeader"
import Avatar from "@mui/material/Avatar"

import { graphql } from "../gql"

const principleQueryDocument = graphql(`
    query Principle {
        principle {
            id
        }
    }
`)

function PrincipleCard({ id, title = id }: { id: string; title?: string }) {
    return (
        <Card key={id}>
            <CardHeader
                title={title}
                avatar={
                    <Avatar variant="square" src={`/data/${id}.png`}></Avatar>
                }
            />
        </Card>
    )
}

const Principles = () => {
    const [{ data }] = useQuery({ query: principleQueryDocument })
    return (
        <Box
            sx={{
                maxWidth: "350px",
                marginBlock: 1,
                marginInline: "auto",
                display: "flex",
                flexDirection: "column",
                rowGap: 1,
            }}
        >
            {data!.principle.map(({ id }) => (
                <PrincipleCard key={id} id={id} />
            ))}
        </Box>
    )
}

export { PrincipleCard, Principles as default }
