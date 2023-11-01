import { useCallback, useReducer, useState } from "react"
import { useQuery } from "urql"

import Button from "@mui/material/Button"
import Card from "@mui/material/Card"
import CardActions from "@mui/material/CardActions"
import CardHeader from "@mui/material/CardHeader"
import Collapse from "@mui/material/Collapse"
import Stack from "@mui/material/Stack"

import ExpandLess from "@mui/icons-material/ExpandLess"
import ExpandMore from "@mui/icons-material/ExpandMore"

import PrincipleFilterBar from "../components/PrincipleFilterBar"
import { getPrinciples } from "../components/_filters"
import { graphql } from "../gql"
import * as types from "../gql/graphql"
import { Principle } from "../types"
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

interface VisibleWorkstation extends WorkstationFromQuery {
    isVisible: boolean
}

type WorkstationAction = {
    type: "filter"
    principle: Principle | undefined
}

function workstationReducer(
    state: WorkstationFromQuery[],
    action: WorkstationAction,
): VisibleWorkstation[] {
    switch (action.type) {
        case "filter":
            const workstationData: VisibleWorkstation[] = state.map(
                (workstation) => ({
                    ...workstation,
                    isVisible: true,
                }),
            )
            if (!action.principle) return workstationData
            return workstationData.map((workstation) => {
                const workstationPrinciples = new Set(
                    getPrinciples(workstation).map(({ id }) => id),
                )
                if (
                    action.principle &&
                    !workstationPrinciples.has(action.principle.id)
                ) {
                    return { ...workstation, isVisible: false }
                }
                return workstation
            })
    }
}

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

    const initialState: VisibleWorkstation[] = data!.workstation.map(
        (workstation) => ({ ...workstation, isVisible: true }),
    )
    const [state, dispatch] = useReducer(workstationReducer, initialState)
    const [selectedPrinciple, setPrinciple] = useState<Principle | undefined>(
        undefined,
    )
    const handleSelectedPrinciple = useCallback(
        (principle: Principle | undefined) => {
            dispatch({ type: "filter", principle })
            setPrinciple(principle)
        },
        [dispatch, setPrinciple],
    )
    return (
        <Stack maxWidth="md" marginInline="auto" spacing={2}>
            <PrincipleFilterBar
                selectedPrinciple={selectedPrinciple}
                onSelectPrinciple={handleSelectedPrinciple}
            />
            {state!
                .filter(({ isVisible }) => isVisible)
                .map((workstation) => (
                    <Workstation
                        key={workstation.id}
                        workstation={workstation}
                    />
                ))}
        </Stack>
    )
}
export default WorkstationView
