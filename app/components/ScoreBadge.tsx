interface ScoreBadgeProps {
    score: number;
}

const ScoreBadge = ({ score }: ScoreBadgeProps) => {
    let badgeColor = "";
    let textColor = "";
    let label = "";

    if (score > 70) {
        badgeColor = "bg-badge-green";
        textColor = "text-green-600";
        label = "Strong";
    } else if (score > 49) {
        badgeColor = "bg-badge-yellow";
        textColor = "text-yellow-600";
        label = "Good Start";
    } else {
        badgeColor = "bg-badge-red";
        textColor = "text-red-600";
        label = "Needs Work";
    }

    return (
        <div className={`${badgeColor} px-3 py-1 rounded-full`}>
            <p className={`${textColor} text-sm font-medium`}>{label}</p>
        </div>
    );
};

export default ScoreBadge;