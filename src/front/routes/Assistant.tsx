import { Suspense, useCallback, useState } from "react"
import { useQuery } from "urql"

import Autocomplete from "@mui/material/Autocomplete"
import Avatar, { AvatarProps } from "@mui/material/Avatar"
import Card from "@mui/material/Card"
import CardActions from "@mui/material/CardActions"
import CardContent from "@mui/material/CardContent"
import Container from "@mui/material/Container"
import ListItem from "@mui/material/ListItem"
import ListItemButton from "@mui/material/ListItemButton"
import ListItemIcon from "@mui/material/ListItemIcon"
import ListItemText from "@mui/material/ListItemText"
import Stack from "@mui/material/Stack"
import TextField from "@mui/material/TextField"
import ToggleButton from "@mui/material/ToggleButton"
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup"
import Typography from "@mui/material/Typography"

import LoadingIndicator from "../components/LoadingIndicator"
import { graphql } from "../gql"
import * as types from "../gql/graphql"
import { DrawerContextProvider, ItemsView } from "./Items"
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
    types.AssistantQuery["assistant"][number]["base_principles"][number]["principle"]

interface AssistantItemProps {
    principle: PrincipleFromQuery
    assistant: AssistantFromQuery
}

interface ExaltationIconProps extends Omit<AvatarProps, "src"> {
    exaltation: string
}

const ExaltationIcon = ({
    exaltation,
    alt = exaltation,
    title = exaltation,
    variant = "square",
    ...props
}: ExaltationIconProps) => (
    <Avatar
        alt={alt}
        title={title}
        variant={variant}
        src={
            new URL(`/data/exaltation/${exaltation}.png`, import.meta.url).href
        }
        {...props}
    />
)

interface AssistantIconProps extends Omit<AvatarProps, "src"> {
    assistant: string
}

const AssistantIcon = ({
    assistant,
    alt = assistant,
    title = assistant,
    variant = "square",
    ...props
}: AssistantIconProps) => (
    <Avatar
        alt={alt}
        title={title}
        variant={variant}
        src={new URL(`/data/assistant/${assistant}.png`, import.meta.url).href}
        {...props}
    />
)

const AssistantItems = ({ principle, assistant }: AssistantItemProps) => (
    <Stack>
        {assistant.aspects.map((aspect) => (
            <div key={aspect.id}>
                <Typography variant="h5" color={"secondary"}>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <ExaltationIcon exaltation={aspect.id} /> {aspect.id}
                    </Stack>
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
            <CardContent>
                <Autocomplete<AssistantFromQuery>
                    options={assistants}
                    isOptionEqualToValue={(a, b) => a.id === b.id}
                    getOptionLabel={({ id }) => id}
                    renderOption={(props, { id }) => (
                        <ListItem {...props} disablePadding>
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
                                        id={principle.id}
                                        sx={{ marginInlineEnd: 1 }}
                                    />
                                    {count}
                                </ToggleButton>
                            ),
                        )}
                    </ToggleButtonGroup>
                    <AssistantIcon
                        assistant={selectedAssistant.id}
                        sx={{ width: "3rem", height: "3rem" }}
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
