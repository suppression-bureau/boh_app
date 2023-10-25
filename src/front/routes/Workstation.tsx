import { useQuery } from "urql"

import Card from "@mui/material/Card"
import CardHeader from "@mui/material/CardHeader"
import Divider from "@mui/material/Divider"
import Stack from "@mui/material/Stack"

import { graphql } from "../gql"
import * as types from "../gql/graphql"
import { Aspect } from "./Aspects"
import { PrincipleCard } from "./Principles"

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
                name
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

const WorkstationSlot = (workstation_slot: WorkstationSlotFromQuery) => (
    <Card>
        <CardHeader title={workstation_slot.name} />
        <Stack direction="row" gap={1}>
            {workstation_slot.accepts!.map(({ id }) => (
                <Aspect key={id} id={id} nameAspect={false} />
            ))}
        </Stack>
    </Card>
)

const Workstation = ({
    workstation,
}: {
    workstation: WorkstationFromQuery
}) => (
    <Card>
        <CardHeader title={workstation.id} />
        <Stack direction="row">
            {workstation.principles!.map(({ id }) => (
                <PrincipleCard key={id} id={id} title="" />
            ))}
        </Stack>
        <Stack
            direction="row"
            divider={<Divider orientation="vertical" flexItem />}
        >
            {workstation.workstation_slots!.map((slot) => (
                <WorkstationSlot key={slot.name} {...slot} />
            ))}
        </Stack>
    </Card>
)

const WorkstationView = () => {
    const [{ data }] = useQuery({ query: workstationQueryDocument })

    return (
        <Stack maxWidth="lg" marginInline="auto">
            {data!.workstation.map((workstation) => (
                <Workstation key={workstation.id} workstation={workstation} />
            ))}
        </Stack>
    )
}
export default WorkstationView
