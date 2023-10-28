import { CardHeader } from "@mui/material"
import { useQuery } from "urql"

import Avatar, { AvatarProps } from "@mui/material/Avatar"
import AvatarGroup from "@mui/material/AvatarGroup"
import Box from "@mui/material/Box"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import ListItemText from "@mui/material/ListItemText"

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

type AspectFromQuery = types.AspectsQuery["aspect"][number]
interface BasicAspect extends Omit<AspectFromQuery, "assistants"> {
    assistants?: AspectFromQuery["assistants"]
}

interface AspectIconProps extends AvatarProps {
    id: string
}
const AspectIcon = ({ id, ...props }: AspectIconProps) => (
    <Avatar variant="square" src={`/data/aspect/${id}.png`} {...props}></Avatar>
)

const AspectIconGroup = ({ aspects }: { aspects: BasicAspect[] }) => (
    <AvatarGroup variant="square" max={10} sx={{ border: 0 }}>
        {/* AvatarGroup spacing can only reduce overlap, max is 5 by default*/}
        {aspects.map(({ id }) => (
            <AspectIcon key={id} id={id} sx={{ paddingInline: 1 }} />
        ))}
    </AvatarGroup>
)

interface AspectProps extends BasicAspect {
    nameAspect?: boolean
    showAssistant?: boolean
}

function Aspect({
    nameAspect = true,
    showAssistant = false,
    id,
    assistants = [],
}: AspectProps) {
    return (
        <Card>
            <CardHeader
                title={nameAspect ? id : ""}
                avatar={<AspectIcon id={id} />}
            />
            <CardContent>
                {showAssistant && assistants!.length > 0 && (
                    <List disablePadding>
                        {assistants!.map(({ id }) => (
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

export { Aspect, AspectIconGroup, AspectsView as default }
