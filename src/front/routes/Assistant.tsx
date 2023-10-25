import { Suspense, useCallback, useState } from "react"
import { useQuery } from "urql"

import Autocomplete from "@mui/material/Autocomplete"
import Button from "@mui/material/Button"
import Card from "@mui/material/Card"
import CardActions from "@mui/material/CardActions"
import Container from "@mui/material/Container"
import Stack from "@mui/material/Stack"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"

import { graphql } from "../gql"
import * as types from "../gql/graphql"
import ItemsView from "./Items"
import { PrincipleIcon } from "./Principles"

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
    types.AssistantQuery["assistant"][number]["base_principles"][number]["principle"][number]

type AssistantItemProps = {
    principle: PrincipleFromQuery["id"]
    assistant: AssistantFromQuery
}

const AssistantItems = ({ principle, assistant }: AssistantItemProps) => (
    <Stack>
        {assistant?.aspects!.map((aspect) => (
            <div key={`${aspect!.id}grouping`}>
                <Typography
                    key={`${aspect!.id}header`}
                    variant="h5"
                    color={"secondary"}
                >
                    {aspect?.id}
                </Typography>
                <ItemsView
                    key={`${aspect!.id}${principle}`}
                    filters={{
                        [principle]: true,
                        aspect: aspect!.id,
                    }}
                />
            </div>
        ))}
    </Stack>
)

type PrincipleFilterButtonProps = {
    principle: PrincipleFromQuery
    selectedPrinciple: PrincipleFromQuery["id"]
    count: number
    handlePrincipleFilter(principle: PrincipleFromQuery): void
}

const PrincipleFilterButton = ({
    principle,
    selectedPrinciple,
    count,
    handlePrincipleFilter,
}: PrincipleFilterButtonProps) => (
    <Button
        key={principle.id}
        startIcon={<PrincipleIcon id={principle.id} />}
        onClick={() => handlePrincipleFilter(principle.id)}
        variant={selectedPrinciple === principle.id ? "contained" : "outlined"}
    >
        {count}
    </Button>
)

const AssistantView = () => {
    const [{ data }] = useQuery({ query: assistantQueryDocument })
    const [selectedAssistant, setAssistant] =
        useState<AssistantFromQuery | null>(null)

    const [selectedPrinciple, setPrinciple] =
        useState<PrincipleFromQuery | null>(null)

    const handleNewAssistant = useCallback(
        (
            _event: React.SyntheticEvent,
            assistant: AssistantFromQuery | null,
        ) => {
            setAssistant(assistant)
            if (selectedPrinciple) {
                setPrinciple(null)
            }
        },
        [setAssistant, selectedPrinciple, setPrinciple],
    )

    const handlePrinciple = useCallback(
        (principle: PrincipleFromQuery) => {
            setPrinciple(principle)
        },
        [setPrinciple],
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
                    {selectedAssistant &&
                        selectedAssistant.base_principles!.map(
                            ({ principle, count }) => (
                                <PrincipleFilterButton
                                    principle={principle}
                                    selectedPrinciple={selectedPrinciple}
                                    count={count}
                                    handlePrincipleFilter={handlePrinciple}
                                />
                            ),
                        )}
                </CardActions>
            </Card>
            <Suspense fallback={"Loading..."}>
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
