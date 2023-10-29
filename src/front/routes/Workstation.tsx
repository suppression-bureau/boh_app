import { useState } from "react"
import { useQuery } from "urql"

import Button from "@mui/material/Button"
import Card from "@mui/material/Card"
import CardActions from "@mui/material/CardActions"
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
type Principle = WorkstationFromQuery["principles"][number]

interface WorkstationSlotProps {
    workstationSlot: WorkstationSlotFromQuery
    principles: Principle[]
}

const WorkstationSlotInfoCard = ({
    name,
    accepts,
}: WorkstationSlotFromQuery) => {
    return (
        <Card sx={{ boxShadow: "none" }}>
            <CardHeader
                title={name}
                titleTypographyProps={{ variant: "h6" }}
                avatar={<AspectIconGroup aspects={accepts} />}
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
        <Card>
            <CardActions>
                <WorkstationSlotInfoCard {...workstationSlot} />
                <Button
                    onClick={() => setExpanded(!expanded)}
                    endIcon={expanded ? <ExpandLess /> : <ExpandMore />}
                    sx={{ ml: "auto" }}
                >
                    Show Items
                </Button>
            </CardActions>
            <Collapse in={expanded} timeout="auto" unmountOnExit>
                <ItemsView
                    filters={{
                        aspects: workstationSlot.accepts,
                        principles,
                    }}
                />
            </Collapse>
        </Card>
    )
}

interface WorkstationProps {
    workstation: WorkstationFromQuery
}

const Workstation = ({ workstation }: WorkstationProps) => (
    <Card sx={{ boxShadow: "none" }}>
        <CardHeader
            title={workstation.id}
            titleTypographyProps={{ variant: "h5" }}
            avatar={<PrincipleIconGroup principles={workstation.principles} />}
        />
        <Stack spacing={2}>
            {workstation.workstation_slots
                .toSorted((a, b) => a.index - b.index)
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
