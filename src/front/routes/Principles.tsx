import { useQuery } from "urql"

import Box from "@mui/material/Box"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
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
        <Card key={props.id} sx={{ display: "inline-flex" }}>
            <CardContent>
                <Avatar
                    variant="square"
                    src={`/data/${props.id}.png`}
                    sx={{ display: "inline-flex" }}
                ></Avatar>
                <Typography
                    gutterBottom
                    variant="h5"
                    sx={{
                        display: "inline-flex",
                        paddingLeft: "10px",
                    }}
                >
                    {props.id}
                </Typography>
            </CardContent>
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
