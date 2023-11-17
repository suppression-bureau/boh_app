import { useCallback, useMemo, useReducer, useState } from "react"
import { ErrorBoundary } from "react-error-boundary"
import { useQuery } from "urql"

import Button from "@mui/material/Button"
import Card from "@mui/material/Card"
import CardActions from "@mui/material/CardActions"
import CardHeader from "@mui/material/CardHeader"
import Collapse from "@mui/material/Collapse"
import Stack from "@mui/material/Stack"

import ExpandLess from "@mui/icons-material/ExpandLess"
import ExpandMore from "@mui/icons-material/ExpandMore"

import ErrorDisplay from "../components/ErrorDisplay"
import {
    ItemsDrawerContextProvider,
    itemsQueryDocument,
} from "../components/ItemsDrawer/context"
import PrincipleFilterBar from "../components/PrincipleFilterBar"
import { getPrinciples } from "../filters"
import { graphql } from "../gql"
import * as types from "../gql/graphql"
import { AspectIconGroup } from "./Aspects"
import { ItemsView } from "./Items"
import { PrincipleIconGroup } from "./Principles"
import { SkillsStack, skillQueryDocument } from "./Skills"

const workstationQueryDocument = graphql(`
    query Workstation {
        workstation {
            id
            principles
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

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type WorkstationAction = {
    type: "filter"
    principle: types.Principle | undefined
}

function workstationReducer(
    state: VisibleWorkstation[],
    action: WorkstationAction,
): VisibleWorkstation[] {
    switch (action.type) {
        case "filter": {
            const workstationData: VisibleWorkstation[] = state.map(
                (workstation) => ({
                    ...workstation,
                    isVisible: true,
                }),
            )
            if (!action.principle) return workstationData
            return workstationData.map((workstation) => {
                const workstationPrinciples = new Set(
                    getPrinciples(workstation),
                )
                if (
                    action.principle &&
                    !workstationPrinciples.has(action.principle)
                ) {
                    return { ...workstation, isVisible: false }
                }
                return workstation
            })
        }
    }
}

interface WorkstationSlotProps {
    workstationSlot: WorkstationSlotFromQuery
    principles: types.Principle[]
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
    const toggleExpanded = useCallback(
        () => setExpanded(!expanded),
        [expanded, setExpanded],
    )
    return (
        <Card>
            <CardActions>
                <WorkstationSlotInfoCard {...workstationSlot} />
                <Button
                    onClick={toggleExpanded}
                    endIcon={expanded ? <ExpandLess /> : <ExpandMore />}
                    sx={{ ml: "auto" }}
                >
                    Show Items
                </Button>
            </CardActions>
            {/* without the prefetching, the Collapse transition and urql have a bad interaction */}
            <ErrorBoundary FallbackComponent={ErrorDisplay}>
                <Collapse
                    in={expanded}
                    timeout="auto"
                    mountOnEnter
                    unmountOnExit
                >
                    {workstationSlot.id === "Skill" ? (
                        <SkillsStack selectedPrinciples={principles} />
                    ) : (
                        <ItemsView
                            filters={{
                                aspects: workstationSlot.accepts,
                                principles,
                            }}
                        />
                    )}
                </Collapse>
            </ErrorBoundary>
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
            avatar={
                <PrincipleIconGroup principles={getPrinciples(workstation)} />
            }
        />
        <Stack spacing={2}>
            {workstation.workstation_slots
                .toSorted((a, b) => a.index - b.index)
                .map((slot) => (
                    <WorkstationSlot
                        key={slot.id}
                        workstationSlot={slot}
                        principles={getPrinciples(workstation)}
                    />
                ))}
        </Stack>
    </Card>
)

export default function WorkstationView() {
    const [{ data }] = useQuery({ query: workstationQueryDocument })
    // prefetch
    useQuery({ query: skillQueryDocument })
    useQuery({ query: itemsQueryDocument })

    const initialState: VisibleWorkstation[] = useMemo(
        () =>
            data!.workstation.map((workstation) => ({
                ...workstation,
                isVisible: true,
            })),
        [data],
    )
    const [state, dispatch] = useReducer(workstationReducer, initialState)
    const [selectedPrinciple, setPrinciple] = useState<
        types.Principle | undefined
    >()
    const handleSelectedPrinciple = useCallback(
        (principle: types.Principle | undefined) => {
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
            <ItemsDrawerContextProvider>
                {state
                    .filter(({ isVisible }) => isVisible)
                    .map((workstation) => (
                        <Workstation
                            key={workstation.id}
                            workstation={workstation}
                        />
                    ))}
            </ItemsDrawerContextProvider>
        </Stack>
    )
}
