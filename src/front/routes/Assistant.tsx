import { Suspense, useCallback, useState } from "react"
import { useQuery } from "urql"

import Autocomplete from "@mui/material/Autocomplete"
import Card from "@mui/material/Card"
import CardActions from "@mui/material/CardActions"
import Container from "@mui/material/Container"
import Stack from "@mui/material/Stack"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"

import LoadingIndicator from "../components/LoadingIndicator"
import PrincipleFilterButton from "../components/PrincipleFilterButton"
import { graphql } from "../gql"
import * as types from "../gql/graphql"
import ItemsView from "./Items"

const assistantQueryDocument = graphql(`
    query Assistant {
        assistant {
            id
            season
            base_principles {
                principle {
                    id
                }
                count
            }
            aspects {
                id
            }
        }
    }
`)

type AssistantFromQuery = types.AssistantQuery["assistant"][number]
type PrincipleFromQuery =
    types.AssistantQuery["assistant"][number]["base_principles"][number]["principle"]

interface AssistantItemProps {
    principle: PrincipleFromQuery
    assistant: AssistantFromQuery
}

const AssistantItems = ({ principle, assistant }: AssistantItemProps) => (
    <Stack>
        {assistant.aspects.map((aspect) => (
            <div key={`${aspect.id}grouping`}>
                <Typography variant="h5" color={"secondary"}>
                    {aspect.id}
                </Typography>
                <ItemsView
                    filters={{
                        principles: [principle],
                        aspects: [aspect],
                    }}
                />
            </div>
        ))}
    </Stack>
)

const AssistantView = () => {
    const [{ data }] = useQuery({ query: assistantQueryDocument })
    const [selectedAssistant, setAssistant] = useState<
        AssistantFromQuery | undefined
    >()

    const [selectedPrinciple, setPrinciple] = useState<
        PrincipleFromQuery | undefined
    >()

    const handleNewAssistant = useCallback(
        (
            _event: React.SyntheticEvent,
            assistant?: AssistantFromQuery | undefined | null,
        ) => {
            setAssistant(assistant ?? undefined)
            if (selectedPrinciple) {
                // eslint-disable-next-line unicorn/no-useless-undefined
                setPrinciple(undefined)
            }
        },
        [setAssistant, selectedPrinciple, setPrinciple],
    )

    return (
        <Container maxWidth="sm">
            <Card sx={{ padding: 2 }}>
                <Autocomplete
                    options={data!.assistant}
                    getOptionLabel={({ id }) => id}
                    isOptionEqualToValue={(a, b) => a.id === b.id}
                    renderInput={(params) => (
                        <TextField {...params} label="Select your Assistant" />
                    )}
                    onChange={handleNewAssistant}
                />
                <CardActions>
                    {selectedAssistant?.base_principles.map(
                        ({ principle, count }) => (
                            <PrincipleFilterButton
                                key={principle.id}
                                principle={principle}
                                selectedPrinciple={selectedPrinciple}
                                count={count}
                                onPrincipleFilter={setPrinciple}
                            />
                        ),
                    )}
                </CardActions>
            </Card>
            <Suspense fallback={<LoadingIndicator />}>
                {selectedAssistant && selectedPrinciple && (
                    <AssistantItems
                        principle={selectedPrinciple}
                        assistant={selectedAssistant}
                    />
                )}
            </Suspense>
        </Container>
    )
}
export default AssistantView
