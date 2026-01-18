import { PropsOf } from "@emotion/react"
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

import { Collapsible } from "../components/Collapsible"
import {
    AssistantIcon,
    ExaltationIcon,
    PrincipleIcon,
} from "../components/Icon"
import {
    ItemsDrawerContextProvider,
    useItemsDrawer,
} from "../components/ItemsDrawer/context"
import LoadingIndicator from "../components/LoadingIndicator"
import PrincipleFilterBar from "../components/PrincipleFilterBar"
import { graphql } from "../gql"
import { AssistantQuery, Principle } from "../gql/graphql"
import { ItemsView } from "./Items"

const assistantQueryDocument = graphql(`
    query Assistant {
        assistant {
            id
            season
            base_principles {
                principle
                count
            }
            aspects {
                id
            }
        }
    }
`)

type AssistantFromQuery = AssistantQuery["assistant"][number]
type PrincipleFromQuery =
    AssistantQuery["assistant"][number]["base_principles"][number]["principle"]

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
                    group={aspect.id}
                />
            </CardContent>
        </Card>
    ))

interface AssistantOptionProps {
    props: PropsOf<typeof ListItem>
    id: AssistantFromQuery["id"]
    basePrinciples: AssistantFromQuery["base_principles"]
}

const AssistantOption = ({
    props,
    id,
    basePrinciples,
}: AssistantOptionProps) => {
    return (
        // Can’t use disablePadding here somehow
        <ListItem {...props} sx={{ padding: "0!important" }}>
            <ListItemButton>
                <ListItemIcon>
                    <AssistantIcon assistant={id} />
                </ListItemIcon>
                <ListItemText>{id}</ListItemText>
                {basePrinciples.map(({ principle }) => (
                    <ListItemIcon key={principle}>
                        <PrincipleIcon
                            key={principle}
                            principle={principle}
                            sx={{ marginInlineEnd: 1 }}
                        />
                    </ListItemIcon>
                ))}
            </ListItemButton>
        </ListItem>
    )
}

interface BasePrincipleButtonGroupProps {
    selectedPrinciple?: Principle | undefined
    onSelectPrinciple: (this: void, _: unknown, principle?: Principle) => void
    selectedAssistant: AssistantFromQuery
}

const BasePrincipleButtonGroup = ({
    selectedPrinciple,
    onSelectPrinciple,
    selectedAssistant,
}: BasePrincipleButtonGroupProps) => (
    <ToggleButtonGroup
        exclusive
        value={selectedPrinciple}
        onChange={onSelectPrinciple}
    >
        {selectedAssistant.base_principles.map(({ principle, count }) => (
            <ToggleButton key={principle} value={principle}>
                <PrincipleIcon
                    principle={principle}
                    sx={{ marginInlineEnd: 1 }}
                />
                {count}
            </ToggleButton>
        ))}
    </ToggleButtonGroup>
)

interface AssistantPrincipleSelectorProps {
    assistants: AssistantFromQuery[]
    selectedPrinciple?: Principle | undefined
    selectedAssistant?: AssistantFromQuery | undefined
    onSelectAssistant?(this: void, assistant?: AssistantFromQuery): void
    onSelectPrinciple?(this: void, principle?: Principle): void
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
    const { setBaseCounts } = useItemsDrawer()
    const handleSelectAssistant = useCallback(
        (_: unknown, a: AssistantFromQuery | undefined | null) => {
            onSelectAssistant?.(a ?? undefined)
            if (a) {
                setBaseCounts(a.base_principles)
            }
        },
        [onSelectAssistant, setBaseCounts],
    )
    const handleSelectPrinciple = useCallback(
        (_: unknown, p: PrincipleFromQuery | undefined) =>
            onSelectPrinciple?.(p),
        [onSelectPrinciple],
    )
    const excludedPrinciples = selectedAssistant?.base_principles.map(
        ({ principle }) => principle,
    )
    return (
        <Card sx={{ padding: 2 }}>
            <CardContent sx={{ padding: 1 }}>
                <Autocomplete<AssistantFromQuery>
                    options={assistants}
                    isOptionEqualToValue={(a, b) => a.id === b.id}
                    getOptionLabel={({ id }) => id}
                    renderOption={(props, { id, base_principles }) => (
                        <AssistantOption
                            key={id}
                            props={props}
                            id={id}
                            basePrinciples={base_principles}
                        />
                    )}
                    renderInput={(params) => (
                        <TextField {...params} label="Select your Assistant" />
                    )}
                    onChange={handleSelectAssistant}
                />
            </CardContent>
            {selectedAssistant && (
                <>
                    <CardActions sx={{ justifyContent: "space-between" }}>
                        <BasePrincipleButtonGroup
                            selectedAssistant={selectedAssistant}
                            onSelectPrinciple={handleSelectPrinciple}
                            selectedPrinciple={selectedPrinciple}
                        />
                        <AssistantIcon
                            assistant={selectedAssistant.id}
                            sx={{ width: s, height: s }}
                            variant="rounded"
                        />
                    </CardActions>
                    <Collapsible
                        cardHeader={
                            <CardHeader
                                title="Boost another principle"
                                titleTypographyProps={{ variant: "body1" }}
                            />
                        }
                    >
                        <PrincipleFilterBar
                            selectedPrinciple={selectedPrinciple}
                            onSelectPrinciple={onSelectPrinciple!}
                            exclude={excludedPrinciples}
                        />
                    </Collapsible>
                </>
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
        (assistant?: AssistantFromQuery) => {
            setAssistant(assistant)
            if (selectedPrinciple) {
                setPrinciple(undefined)
            }
        },
        [setAssistant, selectedPrinciple, setPrinciple],
    )

    return (
        <ItemsDrawerContextProvider>
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
                            <AssistantItems
                                principle={selectedPrinciple}
                                assistant={selectedAssistant}
                            />
                        )}
                    </Suspense>
                </Stack>
            </Container>
        </ItemsDrawerContextProvider>
    )
}
export default AssistantView
