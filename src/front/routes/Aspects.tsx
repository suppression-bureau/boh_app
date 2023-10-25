import { CardHeader } from "@mui/material"
import { useQuery } from "urql"

import Avatar from "@mui/material/Avatar"
import Box from "@mui/material/Box"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import ListItemText from "@mui/material/ListItemText"
import Typography from "@mui/material/Typography"

import { graphql } from "../gql"
import * as types from "../gql/graphql"

const aspectQueryDocument = graphql(`
    query Aspects {
        aspect {
            id
            assistants {
                id
            }
        }
    }
`)

function AspectIcon({ id }: { id: string }) {
    return <Avatar variant="square" src={`/data/aspect/${id}.png`}></Avatar>
}

type AspectFromQuery = types.AspectsQuery["aspect"][number]

interface AspectProps extends AspectFromQuery {
    nameAspect?: boolean
    showAssistant?: boolean
}
function Aspect({ nameAspect = true, showAssistant, ...aspect }: AspectProps) {
    return (
        <Card key={aspect.id}>
            <CardHeader
                title={nameAspect ? aspect.id : ""}
                avatar={<AspectIcon id={aspect.id} />}
            />
            <CardContent>
                {showAssistant && aspect.assistants!.length > 0 && (
                    <List disablePadding>
                        {aspect.assistants!.map(({ id }) => (
                            <ListItem key={id} sx={{ pl: 4 }}>
                                <ListItemText primary={id} />
                            </ListItem>
                        ))}
                    </List>
                )}
            </CardContent>
        </Card>
    )
}

const AspectsView = () => {
    const [{ data }] = useQuery({ query: aspectQueryDocument })
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
            {data!.aspect.map(({ assistants, id }) => (
                <Aspect
                    key={id}
                    showAssistant={true}
                    id={id}
                    assistants={assistants}
                />
            ))}
        </Box>
    )
}

export { Aspect, AspectsView as default }
