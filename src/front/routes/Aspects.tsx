import { useQuery } from "urql"

import Box from "@mui/material/Box"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import ListItemText from "@mui/material/ListItemText"
import Typography from "@mui/material/Typography"

import { graphql } from "../gql"

const postsQueryDocument = graphql(`
    query Aspects {
        aspect {
            id
            assistants {
                id
            }
        }
    }
`)

const Posts = () => {
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
            {data!.aspect
                .filter(({ assistants }) => assistants!.length > 0)
                .map(({ assistants, id }) => (
                    <Card key={id}>
                        <CardContent>
                            <Typography
                                gutterBottom
                                variant="h5"
                                component="div"
                            >
                                {id}
                            </Typography>
                            <List disablePadding>
                                {assistants!.map(({ id }) => (
                                    <ListItem key={id} sx={{ pl: 4 }}>
                                        <ListItemText primary={id} />
                                    </ListItem>
                                ))}
                            </List>
                        </CardContent>
                    </Card>
                ))}
        </Box>
    )
}

export default Posts
