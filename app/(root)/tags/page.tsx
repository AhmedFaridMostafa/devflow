import { getTags } from "@/lib/actions/tag.actions";

const Tags = async () => {
    const result = await getTags({
        page: 1,
        pageSize: 10,
    });

    console.log(result)


    return <div>Tags</div>;
};


export default Tags