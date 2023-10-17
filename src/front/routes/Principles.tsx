import { useQuery } from "urql"

import Box from "@mui/material/Box"
import Card from "@mui/material/Card"
import CardHeader from "@mui/material/CardHeader"
import Avatar from "@mui/material/Avatar"
import Typography from "@mui/material/Typography"

import { graphql } from "../gql"

const postsQueryDocument = graphql(`
    query Principle {
        principle {
            id
        }
    }
`)

function Principle(props) {
    return (
        <Card key={props.id}>
            <CardHeader
                title={props.id}
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
    const [{ data }] = useQuery({ query: postsQueryDocument })
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
                <Principle key={id} id={id} />
            ))}
        </Box>
    )
}

export default Principles
