import { useQuery } from "urql"

import Box from "@mui/material/Box"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import ListItemText from "@mui/material/ListItemText"
import Paper from "@mui/material/Paper"

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
            }}
        >
            <Paper>
                <List>
                    {data!.aspect
                        .filter(({ assistants }) => assistants!.length > 0)
                        .map(({ assistants, id }) => (
                            <ListItem key={id}>
                                <ListItemText primary={id} />
                                <List disablePadding>
                                    {assistants!.map(({ id }) => (
                                        <ListItem key={id} sx={{ pl: 4 }}>
                                            <ListItemText primary={id} />
                                        </ListItem>
                                    ))}
                                </List>
                            </ListItem>
                        ))}
                </List>
            </Paper>
        </Box>
    )
}

export default Posts
