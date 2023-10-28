import { CardActions } from "@mui/material"
import { useState } from "react"
import { useQuery } from "urql"

import Button from "@mui/material/Button"
import Card from "@mui/material/Card"
import CardHeader from "@mui/material/CardHeader"
import Collapse from "@mui/material/Collapse"
import Stack from "@mui/material/Stack"

import ExpandLess from "@mui/icons-material/ExpandLess"
import ExpandMore from "@mui/icons-material/ExpandMore"

import { graphql } from "../gql"
import * as types from "../gql/graphql"
import { AspectIconGroup } from "./Aspects"
import ItemsView from "./Items"
import { PrincipleIconGroup } from "./Principles"

const workstationQueryDocument = graphql(`
    query Workstation {
        workstation {
            id
            principles {
                id
            }
            workstation_type {
                id
            }
            workstation_slots {
                id
                name
                index
                accepts {
                    id
                }
            }
            evolves {
                id
            }
        }
    }
`)

type WorkstationFromQuery = types.WorkstationQuery["workstation"][number]
type WorkstationSlotFromQuery =
    WorkstationFromQuery["workstation_slots"][number]

type Principle = Pick<types.Principle, "id">

interface WorkstationSlotProps {
    workstationSlot: WorkstationSlotFromQuery
    principles: Principle[]
}

const WorkstationSlotInfoCard = ({
    ...workstationSlot
}: WorkstationSlotFromQuery) => {
    return (
        <Card>
            <CardHeader
                title={workstationSlot.name}
                titleTypographyProps={{ variant: "h6" }}
                avatar={<AspectIconGroup aspects={workstationSlot.accepts} />}
            />
        </Card>
    )
}

const WorkstationSlot = ({
    workstationSlot,
    principles,
}: WorkstationSlotProps) => {
    const [expanded, setExpanded] = useState(false)
    return (
        <Card sx={{ boxShadow: "none" }}>
            <CardActions>
                <WorkstationSlotInfoCard {...workstationSlot} />
                <Button
                    onClick={() => setExpanded(!expanded)}
                    endIcon={expanded ? <ExpandLess /> : <ExpandMore />}
                    sx={{ ml: "auto" }}
                >
                    {"Show Items"}
                </Button>
            </CardActions>
            <Collapse in={expanded} timeout="auto" unmountOnExit>
                <ItemsView
                    filters={{
                        aspects: workstationSlot.accepts,
                        principles: principles,
                    }}
                />
            </Collapse>
        </Card>
    )
}

const Workstation = ({
    workstation,
}: {
    workstation: WorkstationFromQuery
}) => (
    <Card>
        <CardHeader
            title={workstation.id}
            titleTypographyProps={{ variant: "h5" }}
            avatar={<PrincipleIconGroup principles={workstation.principles} />}
        />
        <Stack
            // direction="row"
            justifyContent={"space-between"}
            spacing={2}
            useFlexGap
            flexWrap="wrap"
        >
            {workstation
                .workstation_slots!.sort((a, b) => a!.index - b!.index)
                .map((slot) => (
                    <WorkstationSlot
                        key={slot.id}
                        workstationSlot={slot}
                        principles={workstation.principles}
                    />
                ))}
        </Stack>
    </Card>
)

const WorkstationView = () => {
    const [{ data }] = useQuery({ query: workstationQueryDocument })

    return (
        <Stack maxWidth="md" marginInline="auto" spacing={2}>
            {data!.workstation.map((workstation) => (
                <Workstation key={workstation.id} workstation={workstation} />
            ))}
        </Stack>
    )
}
export default WorkstationView