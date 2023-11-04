import { Suspense, useCallback, useState } from "react"
import { useQuery } from "urql"

import Autocomplete from "@mui/material/Autocomplete"
import Card from "@mui/material/Card"
import CardActions from "@mui/material/CardActions"
import CardContent from "@mui/material/CardContent"
import CardHeader from "@mui/material/CardHeader"
import Container from "@mui/material/Container"
import ListItem from "@mui/material/ListItem"
import ListItemButton from "@mui/material/ListItemButton"
import ListItemIcon from "@mui/material/ListItemIcon"
import ListItemText from "@mui/material/ListItemText"
import Stack from "@mui/material/Stack"
import TextField from "@mui/material/TextField"
import ToggleButton from "@mui/material/ToggleButton"
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup"
import { useTheme } from "@mui/material/styles"

import {
    AssistantIcon,
    ExaltationIcon,
    PrincipleIcon,
} from "../components/Icon"
import LoadingIndicator from "../components/LoadingIndicator"
import { graphql } from "../gql"
import * as types from "../gql/graphql"
import { DrawerContextProvider, ItemsView } from "./Items"

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

const AssistantItems = ({ principle, assistant }: AssistantItemProps) =>
    assistant.aspects.map((aspect) => (
        <Card key={aspect.id}>
            <CardHeader
                avatar={<ExaltationIcon exaltation={aspect.id} />}
                title={aspect.id}
                titleTypographyProps={{ variant: "h5", color: "secondary" }}
            />
            <CardContent>
                <ItemsView
                    filters={{
                        principles: [principle],
                        aspects: [aspect],
                    }}
                />
            </CardContent>
        </Card>
    ))

interface AssistantPrincipleSelectorProps {
    assistants: AssistantFromQuery[]
    selectedPrinciple?: PrincipleFromQuery | undefined
    selectedAssistant?: AssistantFromQuery | undefined
    onSelectAssistant?(assistant?: AssistantFromQuery | undefined): void
    onSelectPrinciple?(principle?: PrincipleFromQuery | undefined): void
}

const AssistantPrincipleSelector = ({
    assistants,
    selectedPrinciple,
    selectedAssistant,
    onSelectAssistant,
    onSelectPrinciple,
}: AssistantPrincipleSelectorProps) => {
    const theme = useTheme()
    const s = `calc(40px + ${theme.spacing(3)})`
    const handleSelectAssistant = useCallback(
        (_: unknown, a: AssistantFromQuery | undefined | null) =>
            onSelectAssistant?.(a ?? undefined),
        [onSelectAssistant],
    )
    const handleSelectPrinciple = useCallback(
        (_: unknown, p: PrincipleFromQuery | undefined) =>
            onSelectPrinciple?.(p),
        [onSelectPrinciple],
    )
    return (
        <Card sx={{ padding: 2 }}>
            <CardContent sx={{ padding: 1 }}>
                <Autocomplete<AssistantFromQuery>
                    options={assistants}
                    isOptionEqualToValue={(a, b) => a.id === b.id}
                    getOptionLabel={({ id }) => id}
                    renderOption={(props, { id }) => (
                        // Can’t use disablePadding here somehow
                        <ListItem {...props} sx={{ padding: "0!important" }}>
                            <ListItemButton>
                                <ListItemIcon>
                                    <AssistantIcon assistant={id} />
                                </ListItemIcon>
                                <ListItemText>{id}</ListItemText>
                            </ListItemButton>
                        </ListItem>
                    )}
                    renderInput={(params) => (
                        <TextField {...params} label="Select your Assistant" />
                    )}
                    onChange={handleSelectAssistant}
                />
            </CardContent>
            {selectedAssistant && (
                <CardActions sx={{ justifyContent: "space-between" }}>
                    <ToggleButtonGroup
                        exclusive
                        value={selectedPrinciple}
                        onChange={handleSelectPrinciple}
                    >
                        {selectedAssistant?.base_principles.map(
                            ({ principle, count }) => (
                                <ToggleButton
                                    key={principle.id}
                                    value={principle}
                                >
                                    <PrincipleIcon
                                        principle={principle.id}
                                        sx={{ marginInlineEnd: 1 }}
                                    />
                                    {count}
                                </ToggleButton>
                            ),
                        )}
                    </ToggleButtonGroup>
                    <AssistantIcon
                        assistant={selectedAssistant.id}
                        sx={{ width: s, height: s }}
                        variant="rounded"
                    />
                </CardActions>
            )}
        </Card>
    )
}

const AssistantView = () => {
    const [{ data }] = useQuery({ query: assistantQueryDocument })
    const [selectedAssistant, setAssistant] = useState<
        AssistantFromQuery | undefined
    >()

    const [selectedPrinciple, setPrinciple] = useState<
        PrincipleFromQuery | undefined
    >()

    const handleNewAssistant = useCallback(
        (assistant?: AssistantFromQuery | undefined) => {
            setAssistant(assistant)
            if (selectedPrinciple) {
                // eslint-disable-next-line unicorn/no-useless-undefined
                setPrinciple(undefined)
            }
        },
        [setAssistant, selectedPrinciple, setPrinciple],
    )

    return (
        <Container maxWidth="sm">
            <Stack spacing={2}>
                <AssistantPrincipleSelector
                    assistants={data!.assistant}
                    selectedAssistant={selectedAssistant}
                    onSelectAssistant={handleNewAssistant}
                    selectedPrinciple={selectedPrinciple}
                    onSelectPrinciple={setPrinciple}
                />
                <Suspense fallback={<LoadingIndicator />}>
                    {selectedAssistant && selectedPrinciple && (
                        <DrawerContextProvider>
                            <AssistantItems
                                principle={selectedPrinciple}
                                assistant={selectedAssistant}
                            />
                        </DrawerContextProvider>
                    )}
                </Suspense>
            </Stack>
        </Container>
    )
}
export default AssistantView
