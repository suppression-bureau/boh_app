import { useQuery } from "urql"

import Card from "@mui/material/Card"
import CardHeader from "@mui/material/CardHeader"
import Stack from "@mui/material/Stack"

import { graphql } from "../gql"
import * as types from "../gql/graphql"
import { AspectIconGroup } from "./Aspects"
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

const WorkstationSlot = (workstation_slot: WorkstationSlotFromQuery) => (
    <Card sx={{ boxShadow: "none" }}>
        <CardHeader title={workstation_slot.name} />
        <AspectIconGroup aspects={workstation_slot.accepts} />
    </Card>
)

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
            direction="row"
            // divider={<Divider orientation="vertical" flexItem />}
            justifyContent={"space-between"}
            spacing={2}
            // useFlexGap  // not sure that I want to use this
            // flexWrap="wrap"
        >
            {workstation
                .workstation_slots!.sort((a, b) => a!.index - b!.index)
                .map((slot) => (
                    <WorkstationSlot key={slot.name} {...slot} />
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
