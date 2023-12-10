import { Fragment, useCallback, useMemo, useReducer, useState } from "react"
import { useQuery } from "urql"

import Card from "@mui/material/Card"
import CardHeader from "@mui/material/CardHeader"
import Divider from "@mui/material/Divider"
import Stack from "@mui/material/Stack"

import { Collapsible } from "../components/Collapsible"
import {
    ItemsDrawerContextProvider,
    itemsQueryDocument,
} from "../components/ItemsDrawer/context"
import PrincipleFilterBar from "../components/PrincipleFilterBar"
import { getPrinciples } from "../filters"
import { graphql } from "../gql"
import { Principle, WorkstationQuery } from "../gql/graphql"
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

type WorkstationFromQuery = WorkstationQuery["workstation"][number]
type WorkstationSlotFromQuery =
    WorkstationFromQuery["workstation_slots"][number]

interface VisibleWorkstation extends WorkstationFromQuery {
    isVisible: boolean
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type WorkstationAction = {
    type: "filter"
    principle: Principle | undefined
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
    principles: Principle[]
}

const WorkstationSlotInfo = ({ name, accepts }: WorkstationSlotFromQuery) => (
    <CardHeader
        title={name}
        titleTypographyProps={{ variant: "h6" }}
        avatar={<AspectIconGroup aspects={accepts} />}
    />
)

const WorkstationSlot = ({
    workstationSlot,
    principles,
}: WorkstationSlotProps) => (
    <Collapsible
        buttonShowHideText="Items"
        cardHeader={<WorkstationSlotInfo {...workstationSlot} />}
    >
        {workstationSlot.id === "Skill" ? (
            <SkillsStack selectedPrinciples={principles} />
        ) : (
            <ItemsView
                filters={{
                    aspects: workstationSlot.accepts,
                    principles,
                }}
                group={workstationSlot.id}
            />
        )}
    </Collapsible>
)

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
        <Stack>
            {workstation.workstation_slots
                .toSorted((a, b) => a.index - b.index)
                .map((slot) => (
                    <Fragment key={slot.id}>
                        <Divider variant="middle" />
                        <WorkstationSlot
                            workstationSlot={slot}
                            principles={getPrinciples(workstation)}
                        />
                    </Fragment>
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
    const [selectedPrinciple, setPrinciple] = useState<Principle | undefined>()
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
