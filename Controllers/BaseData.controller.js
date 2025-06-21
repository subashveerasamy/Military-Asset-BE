import baseData from "../Models/BaseData.Schema.js";
import users from '../Models/User.schema.js'
import { format } from 'date-fns';

export const transfer = async (req, res) => {
    let { requesting_base, receiving_base, movement_type, initiator, item_details
    } = req.body;
    const requestingBase = await baseData.findOne({ basename: requesting_base });
    if (movement_type == "purchase") {
        requestingBase.transaction.push({ requesting_base, receiving_base, movement_type, initiator, item_details })
        await requestingBase.save();
        return res.status(200).json({ message: "Ordered Successfully!!", base: requestingBase })
    }
    requestingBase.transaction.push({
        requesting_base, receiving_base, movement_type, initiator, item_details

    })
    await requestingBase.save();


    res.status(200).json({ message: "requested successfully", base: requestingBase });


}

export const updateTransactionFromRequesting = async (req, res) => {
    const { id, requesting_base, receiving_base, basename } = req.body;
    const dynamicKey = Object.keys(req.body).find(key => key !== "id" && key !== "requesting_base" && key !== "receiving_base");
    const approvalValue = req.body[dynamicKey];


    const requestingBase = await baseData.findOne({ basename: requesting_base });
    const receivingBase = await baseData.findOne({ basename: receiving_base });
    const transaction = requestingBase.transaction.find(order => order._id.toString() === id);
     const transactionMap = new Map();

    if (transaction.movement_type == "purchase") {
        if (approvalValue === "approved") {
            const initiation_date_update = format(new Date(), "yyyy-MM-dd");

            Object.assign(transaction, { [dynamicKey]: approvalValue, approved_date: initiation_date_update, initiation_date: initiation_date_update, status: approvalValue, remarks: "ordered successfully" });

        }
        else if (approvalValue === "cancelled") {
            Object.assign(transaction, { [dynamicKey]: approvalValue, status: approvalValue, remarks: "order Cancelled" });

        } else {
           

            transaction.item_details.forEach(data => {
                transactionMap.set(data.specific_name, data.quantity);
            });


            requestingBase.arms_data.forEach(item => {
                if (item.date === approvalValue) {
                    item.arms.forEach(arm => {
                        if (transactionMap.has(arm.specific_name)) {
                            arm.total += transactionMap.get(arm.specific_name);
                            arm.unassigned += transactionMap.get(arm.specific_name);
                        }
                    });
                }
            });
            Object.assign(transaction, { [dynamicKey]: approvalValue, status: "completed" });

        }
        await requestingBase.save();
        return res.status(200).json({ message: "Updated Successfully!!", base: requestingBase })
    }
    else {

        if (dynamicKey === "requesting_base_approval" && approvalValue === "approved") {
            Object.assign(transaction, { [dynamicKey]: approvalValue });
            let trans_purpose = transaction.movement_type == "transfer in" ? "transfer out" : "transfer in";
            
            receivingBase.transaction.push({
                _id: id, requesting_base, receiving_base, movement_type: trans_purpose, initiator: transaction.initiator, requesting_base_approval: approvalValue,
                receiving_base_approval: transaction.receiving_base_approval, approved_date: transaction.approved_date, initiation_date: transaction.initiation_date, completion_date: transaction.completion_date, item_details: transaction.item_details, remarks: transaction.remarks, status: transaction.status
            })
        } else {
            const trans = receivingBase.transaction.find(order => order._id.toString() === id);
           
            let updateOne, updateTwo;
            const functionPositive = (updateOne, updateTwo) => {
                updateOne.item_details.forEach(data => {
                    transactionMap.set(data.specific_name, data.quantity);
                });
                // Step 1: Check if exact date exists
                const hasExactDate = updateTwo.arms_data.some(item => item.date === approvalValue);

                if (!hasExactDate) {
                    const targetDate = new Date(approvalValue);

                    // Step 2: Find the most recent previous date
                    const previousItem = updateTwo.arms_data
                        .filter(item => new Date(item.date) < targetDate)
                        .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

                    if (previousItem) {
                        // Step 3: Clone and push with new date
                        const newItem = JSON.parse(JSON.stringify(previousItem));
                        newItem.date = approvalValue;
                        updateTwo.arms_data.push(newItem);
                    }
                }

                updateTwo.arms_data.forEach(item => {
                    if (item.date === approvalValue) {
                        item.arms.forEach(arm => {
                            if (transactionMap.has(arm.specific_name)) {
                                arm.total += transactionMap.get(arm.specific_name);
                                arm.unassigned += transactionMap.get(arm.specific_name);
                            }
                        });
                    }
                });
            }
            const functionNegative = (updateOne, updateTwo) => {
    updateOne.item_details.forEach(data => {
        transactionMap.set(data.specific_name, data.quantity);
    });

    const hasExactDate = updateTwo.arms_data.some(item => item.date === approvalValue);
    if (!hasExactDate) {
        const targetDate = new Date(approvalValue);
        const previousItem = updateTwo.arms_data
            .filter(item => new Date(item.date) < targetDate)
            .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

        if (previousItem) {
            const newItem = JSON.parse(JSON.stringify(previousItem));
            newItem.date = approvalValue;
            updateTwo.arms_data.push(newItem);
        }
    }

    for (const item of updateTwo.arms_data) {
        if (item.date === approvalValue) {
            for (const arm of item.arms) {
                const tnxValue = transactionMap.get(arm.specific_name);
                if (tnxValue !== undefined) {
                    if (arm.unassigned >= tnxValue) {
                        arm.total -= tnxValue;
                        arm.unassigned -= tnxValue;
                    } else {
                        return { error: true, message: "insufficient arms" };
                    }
                }
            }
        }
    }

    return { error: false };
};
            if (dynamicKey === 'completion_date') {
                if (transaction.movement_type === "transfer in") {
                    updateOne = transaction;
                    updateTwo = requestingBase;
                    functionPositive(updateOne, updateTwo)
                }
                if (transaction.movement_type === "transfer out") {
                    updateOne = transaction;
                    updateTwo = requestingBase;
                    const result = functionNegative(updateOne, updateTwo);
if (result.error) {
    return res.status(200).json({ message: result.message });
}

                }
                if (trans) {
                    if (trans.movement_type === "transfer in") {
                        updateOne = trans;
                        updateTwo = receivingBase;
                        functionPositive(updateOne, updateTwo)

                    } if (trans.movement_type === "transfer out") {
                        updateOne = trans;
                        updateTwo = receivingBase;
                       const result = functionNegative(updateOne, updateTwo);
if (result.error) {
    return res.status(200).json({ message: result.message });
}

                    }
                }
            }

            if (dynamicKey === "receiving_base_approval") {
                if (approvalValue === "approved") {
                    const approved_date_update = format(new Date(), "yyyy-MM-dd");
                    const { remarks } = req.body;
                    Object.assign(transaction, { [dynamicKey]: approvalValue, approved_date: approved_date_update, status: "approved", remarks });

                    Object.assign(trans, { [dynamicKey]: approvalValue, approved_date: approved_date_update, status: "approved", remarks });

                }



                else if (approvalValue === "rejected") {
                    let status = approvalValue;
                    const { remarks } = req.body;
                    Object.assign(transaction, { [dynamicKey]: approvalValue, status, remarks });

                    Object.assign(trans, { [dynamicKey]: approvalValue, status, remarks });

                }
            }
            else {
                let status;
                if (approvalValue === "cancelled") {
                    status = approvalValue;
                }
                else {
                    if (dynamicKey == "initiation_date") {
                        status = "initiated";
                    }
                    else {
                        status = "completed"
                    }
                }
                Object.assign(transaction, { [dynamicKey]: approvalValue, status });

                Object.assign(trans, { [dynamicKey]: approvalValue, status });


            }


        }
        
        await requestingBase.save();
        await receivingBase.save();
        const base = await baseData.findOne({ basename })
         res.status(200).json({ message: "updated successfully", base });

    }

}


export const getBaseData = async (req, res) => {
    try {
        const id = req.user.id;
        const user = await users.findById(id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if(req.user.role === "admin"){
            const base = await baseData.find();
            return res.status(200).json({ base });
        }
        const basename = user.base;
        const base = await baseData.findOne({ basename });

        if (!base) {
            return res.status(404).json({ message: "Base not found" });
        }

        return res.status(200).json({ base });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

export const addArmsData = async (req, res) => {
    try {
        const { basename, date, query } = req.body;
        const base = await baseData.findOne({ basename });
         if (!base) {
            return res.status(404).json({ message: "Base not found" });
        }
        const addingdata = {
            date,
            arms: query
        }
        base.arms_data.push(addingdata);
        await base.save();

        res.status(200).json({ message: "New arms data added successfully", base });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

export const assignArms = async (req, res) => {
    const { soldier_name, soldier_serial, arm_name, specific_name, condition, assign_remarks, quantity, basename } = req.body;
    const assigned_date = format(new Date(), "yyyy-MM-dd");
    const base = await baseData.findOne({ basename });
    base.assigned_expenditure.push({ soldier_name, soldier_serial, arm_name, specific_name, condition, assign_remarks, quantity, assigned_date });

    let assigned = false;

for (const item of base.arms_data) {
    if (item.date === assigned_date) {
        for (const arm of item.arms) {
            if (arm.specific_name === specific_name) {
                if (arm.unassigned < quantity) {
                    return res.status(200).json({ message: "Insufficient arms available" });
                }
                arm.assigned += quantity;
                arm.unassigned -= quantity;
                assigned = true;
                break;
            }
        }
        if (assigned) break;
    }
}

if (!assigned) {
    return res.status(404).json({ message: "Specific arm not found for selected date" });
}

// Proceed to save and respond if not already done earlier
await base.save();
return res.status(200).json({ message: "Successfully Assigned!", base });
}
export const getAssignedData = async (req, res) => {
    try {
        const { soldier_serial, basename } = req.query;
         const base = await baseData.findOne({ basename });

        if (!base) {
            return res.status(404).json({ message: "Base not found" });
        }

        const result = base.assigned_expenditure.filter((data) => data.soldier_serial === soldier_serial);

        if (result.length === 0) {
            return res.status(404).json({ message: "Soldier Serial Not Found" });
        }

        res.status(200).json({ result });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

export const expenditure = async (req, res) => {
    try {
        const { soldier_serial, expenditure, reason_for_expenditure, specific_name, basename } = req.body;
        const base = await baseData.findOneAndUpdate(
            { basename }, // Find the document by basename
            {
                $set: {
                    "assigned_expenditure.$[elem].expenditure": expenditure,
                    "assigned_expenditure.$[elem].reason_for_expenditure": reason_for_expenditure
                }
            },
            {
                new: true,
                arrayFilters: [{ "elem.soldier_serial": soldier_serial, "elem.specific_name": specific_name }]
            }
        );
        res.status(200).json({ base });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });

    }
}


export const returnArm = async (req, res) => {
    const { soldier_serial, specific_name, basename, return_remarks } = req.body;
    const base = await baseData.findOneAndUpdate(
        { basename, "assigned_expenditure.$.soldier_serial": soldier_serial, "assigned_expenditure.$.specific_name": specific_name },
        {
            $set: {
                "assigned_expenditure.$.returned_date": format(new Date(), "yyyy-MM-dd"),
                "assigned_expenditure.$.return_remarks": return_remarks
            }
        },
        { new: true }
    );
}


