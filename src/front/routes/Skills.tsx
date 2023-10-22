import axios from "axios"
import { useCallback, useState } from "react"
import { useQuery } from "urql"
import { AsyncActionHandlers, useReducerAsync } from "use-reducer-async"

import Autocomplete from "@mui/material/Autocomplete"
import Button from "@mui/material/Button"
import Card from "@mui/material/Card"
import CardActions from "@mui/material/CardActions"
import CardHeader from "@mui/material/CardHeader"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import Divider from "@mui/material/Divider"
import Stack from "@mui/material/Stack"
import TextField from "@mui/material/TextField"

import UpgradeIcon from "@mui/icons-material/Upgrade"

import { graphql } from "../gql"
import * as types from "../gql/graphql"
import { PrincipleCard } from "../routes/Principles"

const API_URL = "http://localhost:8000"

const skillQueryDocument = graphql(`
    query Skills {
        skill {
            id
            level
            primary_principle {
                id
            }
            secondary_principle {
                id
            }
        }
    }
`)

type SkillFromQuery = types.SkillsQuery["skill"][number]

/** Actions that can be handled synchronously in the reducer */
type SkillAction = SkillActionInner | SkillActionOuter
/** Synchronously handleable actions that are dispatched by the async action handler */
type SkillActionInner = { type: "update"; skill: SkillFromQuery }
/** Synchronously handleable actions that we dispatch manually */
type SkillActionOuter = never

function skillReducer(
    state: SkillFromQuery[],
    action: SkillAction,
): SkillFromQuery[] {
    switch (action.type) {
        case "update": {
            return state.map((skill) => {
                if (skill.id !== action.skill.id) return skill
                return action.skill
            })
        }
    }
}

/** Actions that are handled asynchronously action handler */
type SkillActionAsync = { type: "increment"; skill: SkillFromQuery }

const skillHandlers: AsyncActionHandlers<
    typeof skillReducer,
    SkillActionAsync
> = {
    increment:
        ({ dispatch }) =>
        async ({ skill }) => {
            const { data: updatedSkill } = await axios.patch<SkillFromQuery>(
                `${API_URL}/skill/${skill.id}`,
                {
                    level: skill.level + 1,
                },
            )
            dispatch({ type: "update", skill: updatedSkill })
        },
}

interface SkillProps extends SkillFromQuery {
    onIncrement(skill: SkillFromQuery): void
}

const Skill = ({ onIncrement, ...skill }: SkillProps) => {
    const handleIncrement = useCallback(() => {
        onIncrement(skill)
    }, [skill])
    return (
        <Card key={skill.id}>
            <CardHeader title={skill.id} />
            <CardActions sx={{ gap: 2 }}>
                <PrincipleCard
                    key={skill.primary_principle!.id}
                    id={skill.primary_principle!.id}
                    title={skill.level + 1}
                    sx={{ boxShadow: "none" }}
                    disablePadding
                />
                <Divider orientation="vertical" variant="middle" flexItem />
                <PrincipleCard
                    key={skill.secondary_principle!.id}
                    id={skill.secondary_principle!.id}
                    title={skill.level}
                    sx={{ boxShadow: "none" }}
                    disablePadding
                />
                <Button
                    endIcon={
                        <UpgradeIcon stroke="currentColor" strokeWidth={0.5} />
                    }
                    onClick={handleIncrement}
                    sx={{ ml: "auto" }}
                >
                    Upgrade Skill
                </Button>
            </CardActions>
        </Card>
    )
}

const SkillsView = () => {
    const [{ data }] = useQuery({ query: skillQueryDocument })

    const [state, dispatch] = useReducerAsync(
        skillReducer,
        data!.skill,
        skillHandlers,
    )

    const [open, setOpen] = useState(false)
    const [newSkill, setNewSkill] = useState<SkillFromQuery | null>(null)

    const handleClickOpen = useCallback(() => setOpen(true), [setOpen])
    const handleClose = useCallback(() => setOpen(false), [setOpen])
    const handleNewSkill = useCallback(
        (_event: React.SyntheticEvent, skill: SkillFromQuery | null) => {
            setNewSkill(skill)
        },
        [setNewSkill],
    )
    const learnSkill = useCallback(() => {
        if (!newSkill) throw new Error("No skill selected")
        dispatch({ type: "increment", skill: newSkill })
        setOpen(false)
    }, [dispatch, newSkill, setOpen])
    const handleSkillIncrement = useCallback(
        (skill: SkillFromQuery) => dispatch({ type: "increment", skill }),
        [dispatch],
    )

    return (
        <Stack
            spacing={2}
            sx={{
                maxWidth: "450px",
                marginBlock: 1,
                marginInline: "auto",
            }}
        >
            <Button onClick={handleClickOpen} variant="contained">
                Learn new Skill
            </Button>
            <Dialog open={open} onClose={handleClose}>
                <DialogContent>
                    <Autocomplete
                        id="skill-selector"
                        options={state.filter(({ level }) => level == 0)}
                        sx={{ width: 300 }}
                        getOptionLabel={(skill) => skill.id}
                        isOptionEqualToValue={(a, b) => a.id === b.id}
                        renderInput={(params) => (
                            <TextField {...params} label="Skill" />
                        )}
                        onChange={handleNewSkill}
                    />
                    <DialogActions>
                        <Button onClick={handleClose}>Cancel</Button>
                        {/* TODO: also reset autocomplete state to avoid warning */}
                        <Button onClick={learnSkill} disabled={!newSkill}>
                            Learn
                        </Button>
                    </DialogActions>
                </DialogContent>
            </Dialog>
            {state
                .filter(({ level }) => level > 0)
                .map(({ ...skill }) => (
                    <Skill
                        key={skill.id}
                        onIncrement={handleSkillIncrement}
                        {...skill}
                    />
                ))}
        </Stack>
    )
}

export default SkillsView
