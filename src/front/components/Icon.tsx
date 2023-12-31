import Avatar, { AvatarProps } from "@mui/material/Avatar"

import { Principle } from "../gql/graphql"

export type IconType = "principle" | "aspect" | "exaltation" | "assistant"

type BaseIconProps<T extends IconType, ID extends string = string> = Omit<
    AvatarProps,
    "src"
> & {
    // set to "priciple" | ...
    idKey: T
} & {
    // a property called "principle" | ... with string value
    [id in T]: ID
}

const BaseIcon = <T extends IconType>({
    idKey,
    ...allProps
}: BaseIconProps<T>) => {
    const {
        [idKey]: id,
        alt = id,
        title = id,
        variant = "square",
        ...props
    } = allProps
    return (
        <Avatar
            alt={alt}
            title={title}
            variant={variant}
            src={new URL(`/data/${idKey}/${id}.png`, import.meta.url).href}
            {...props}
        />
    )
}

export type AspectIconProps = Omit<BaseIconProps<"aspect">, "idKey">
export const AspectIcon = (props: AspectIconProps) => (
    <BaseIcon idKey="aspect" {...props} />
)

export type PrincipleIconProps = Omit<
    BaseIconProps<"principle", Principle>,
    "idKey"
>
export const PrincipleIcon = (props: PrincipleIconProps) => (
    <BaseIcon idKey="principle" {...props} />
)

export type ExaltationIconProps = Omit<BaseIconProps<"exaltation">, "idKey">
export const ExaltationIcon = (props: ExaltationIconProps) => (
    <BaseIcon idKey="exaltation" {...props} />
)

export type AssistantIconProps = Omit<BaseIconProps<"assistant">, "idKey">
export const AssistantIcon = (props: AssistantIconProps) => (
    <BaseIcon idKey="assistant" {...props} />
)
