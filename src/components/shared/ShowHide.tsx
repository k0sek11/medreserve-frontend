type ShowHideProps = {
    when: boolean;
    children: React.ReactNode;
};

export const Show = ({ when, children }: ShowHideProps) => <>{when ? children : null}</>;

export const Hide = ({ when, children }: ShowHideProps) => <>{when ? null : children}</>;
