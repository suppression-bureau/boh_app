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

function PrincipleCard(props) {
    return (
        <Card key={props.id}>
            <CardHeader
                title={props.title}
                avatar={
                    <Avatar
                        variant="square"
                        src={`/data/${props.id}.png`}
                    ></Avatar>
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
                <PrincipleCard key={id} id={id} title={id} />
            ))}
        </Box>
    )
}

export { PrincipleCard, Principles as default }
