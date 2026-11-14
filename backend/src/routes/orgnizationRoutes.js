const express=require('express');

const authenticate=require('../middleware/isAuth.js');
const { createOrganizationController, getUserOrganisationController,addOrganizationMemberController,getOrganizationMembersController,removeOrganizationMemberController,
    updateOrganizationMemberRoleController } = require('../controller/organizationController');
const { createOrganizationSchema,membershipSchema} = require('../validators/zod.js');
const authorize=require('../middleware/authorize.js')
const validate = require('../middleware/validate');


const router=express.Router();


router.post('/',authenticate,validate(createOrganizationSchema),createOrganizationController)

router.get('/',authenticate,getUserOrganisationController);

router.post('/:organizationId/members',authenticate,authorize("member:invite"),validate(membershipSchema),addOrganizationMemberController)


router.get('/:organizationId/members',authenticate,authorize("member:view"),getOrganizationMembersController)


router.patch(
    "/:organizationId/members/:membershipId/role",
    authenticate,
    authorize("member:update_role"),
    updateOrganizationMemberRoleController
);

router.delete(
    "/:organizationId/members/:membershipId",
    authenticate,
    authorize("member:remove"),
    removeOrganizationMemberController
);



module.exports=router;