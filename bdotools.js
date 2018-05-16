<script>
function calcStacks()
{
//document.getElementById("results").innerHTML=document.getElementById('bstones').value


 var stacks_on_failure = [ 2, 3, 4, 5, 6 ]; // PRI through PEN failstacking on armor
            var maxFailStacks = [ 25, 35, 44, 90, 144 ];
            var accProbArr = [ .15, .075, .05, .02, .015 ]; //base enchant probability
            var aps = [ 0.015, 0.0075, 0.005, 0.0025, 0.0025 ]; //increased chance per fail stack pri to pen gear
            var bstones_per_attempt = 11;
            var bStoneCost = 0; 
                                //  int accStackCost = 0; //cost for stacking cheap accessories together
            var aSuperStoneCost = 0; //concentrated armor stone, used for failstacking AND for enchanting
            var wSuperStoneCost = 0; //concentrated weapon stone
            var repCost = 0; //cost to restore 10 durability on failure

            var finalizedCost = [ 0, 0, 0, 0, 0 ];
            var optStacksArr = [ 0, 0, 0, 0, 0 ];
            var goal=0; 
            var overflowReached = false; //try except
            var cappedStacks = 0; //part of try except overflow
            var prob = 0.025; //+14 gear failstacking base chance
            var cheapestVal = 999999999999; //for comparisons to ensure first value is taken
            var bStoneFee = 0; //TOTAL COST OF N FAILSTACKS
            var current_cost = 0;
            var acc_prob; //determined probability based on all factors including fail stacks
            var resolving_ctr = 0; // use this to determine which level of enchant is being worked on.
            var cProb = 1.0;
            var bsCosts = 15;
            var fs_reg = 0; //amount of fs before switching to duo
            var switched = 0; // if it switched yet
            var prob_duo = 0.0;
            var prob_norm = 0.0;
	    var aCost=0;

//set values equal to input

aCost=parseInt(document.getElementById("input1").value);
aSuperStoneCost=parseInt(document.getElementById("input2").value);
bStoneCost=parseInt(document.getElementById("input3").value);
goal=parseInt(document.getElementById("input4").value);

if(!isNaN(aCost) && !isNaN(aSuperStoneCost) && !isNaN(bStoneCost) && !isNaN(goal))
 {
if (goal > 0 && goal <= 5)
                {
                    //determine most effective way to failstack at start of program
                    while (resolving_ctr < goal)
                    {
                        overflowReached = false;
                        for (current_failstacks = 0; current_failstacks <= maxFailStacks[resolving_ctr]; current_failstacks++)
                        {
                            //determine probability of getting that many fail stacks
                            //prob is chance of individual success, cProb is of cumulative failures
                            bsCosts = 0;
                            cProb = 1;
                            switched = 0;
                            for (passes = 0; passes < current_failstacks; passes++)
                            {
				
                                prob_norm = getRealProb(passes, 0);
                                prob_duo = getRealProb(passes, 1);
				
                                if (useDuo(bStoneCost, aSuperStoneCost, passes, bsCosts, cProb))
                                {
                                    prob = prob_duo;
                                    cProb = cProb * (1 - prob);
                                    bsCosts += aSuperStoneCost;
                                    passes += 3;
                                    if (switched == 0) //identify when to switch to duo armor for failstacking
                                    {
                                        switched = 1;
                                        fs_reg = passes;
                                    }
                                }
                                else
                                {
                                    prob = prob_norm;
                                    //also need to account for cost of blackstones
                                    cProb = cProb * (1 - prob);
                                    bsCosts += parseInt(bStoneCost);
                                }
                            }
                            // need to change to cumulative probability, not single probability(prob)
                            // After a huge sample size test, average failstacks per attempt to stack plateaus at
                            // 11.Therefore, cost per failstack attempt is less than 12 blackstones.
                            if (current_failstacks < 11)
                            {
                                bstones_per_attempt = current_failstacks;
                            }
                            else
                            {
                                bstones_per_attempt = 11;
                            }
                        
                                bStoneFee = bsCosts / cProb;//change to reflect use of duo

                        
                            acc_prob = accProbArr[resolving_ctr] + (current_failstacks * aps[resolving_ctr]);
                            //PRI 
                            if (resolving_ctr == 0 && overflowReached == false)
                            {
                                current_cost = (wSuperStoneCost / acc_prob) + bStoneFee + (aCost*2 / acc_prob);
                            }
                            // DUO

                            else if (overflowReached == false) //CHANGE THIS TO REFLECT COST OF TRI TO PEN
                            {
                                current_cost = (finalizedCost[resolving_ctr - 1] / acc_prob) + (aCost/ acc_prob)  + bStoneFee;
                            }

                            if (current_cost < cheapestVal && overflowReached == false)
                            {
                                optStacksArr[resolving_ctr] = current_failstacks;
                                cheapestVal = current_cost;
                            }
                        }
                        cProb = 1;
                        switched = 0;
                        bsCosts = 0;
                        for (newpasses = 0; newpasses < optStacksArr[resolving_ctr]; newpasses++)
                        {
                            prob_norm = getRealProb(newpasses, 0);
                            prob_duo = getRealProb(newpasses, 1);
                            if (useDuo(bStoneCost, aSuperStoneCost, newpasses, bsCosts, cProb))
                            {
                                prob = prob_duo;
                                cProb = cProb * (1 - prob);
                                bsCosts += aSuperStoneCost;
                                newpasses += 3;
                                if (switched == 0) //identify when to switch to duo armor for failstacking
                                {
                                    switched = 1;
                                    fs_reg = newpasses;
                                }
                            }
                            else
                            {
                                //use +14 armor
                                prob = prob_norm;
                                //also need to account for cost of blackstones
                                cProb = cProb * (1 - prob);
                                bsCosts += bStoneCost;
                            }
                            // cProb= cProb * (1 - prob);
                        }
                        // After a huge sample size test, average failstacks per attempt to stack plateaus at
                        // 11.Therefore, cost per failstack attempt is less than 12 blackstones.
                        if (optStacksArr[resolving_ctr] < 11)
                        {
                            bstones_per_attempt = optStacksArr[resolving_ctr];
                        }
                        else
                        {
                            bstones_per_attempt = 11;
                        }

                        bStoneFee = (bsCosts) / cProb; //change this
                        acc_prob = accProbArr[resolving_ctr] + (optStacksArr[resolving_ctr] * aps[resolving_ctr]);
                        if (resolving_ctr == 0)
                        {
                            finalizedCost[resolving_ctr] = (aCost*2 / acc_prob) + bStoneFee;
                        }


                        else
                        {
                            finalizedCost[resolving_ctr] = (finalizedCost[resolving_ctr - 1] / acc_prob) +(aCost/acc_prob)+ bStoneFee;
                        }
                        cheapestVal = 999999999999;
                        resolving_ctr++;
                    }
                    var optimalStacks = optStacksArr[goal - 1];
                    //  textBlock.Text = "The optimal amount of failstacks to use is" + optimalStacks.ToString();

                    if (fs_reg < optimalStacks)
                    {

			
			
                        document.getElementById("results").innerHTML="Failstack using +14 armor until " + fs_reg + " failstacks, then use DUO armor to failstack until " + optimalStacks;
                    //    textBlock.Text = "Average cost to generate failstacks: " + string.Format("{0:n0}", Math.Round(bStoneFee));
                     //   textBlock7.Text = "Total expected average cost: " + string.Format("{0:n0}", Math.Round(finalizedCost[goal - 1]));
                    }
                    else
                    {
			
                        document.getElementById("results").innerHTML = "Failstack using +14 armor until " + optimalStacks + " failstacks";
                       // textBlock.Text = "Average estimated cost to generate failstacks: " + string.Format("{0:n0}", Math.Round(bStoneFee));
                     //   textBlock7.Text = "Average estimated cost to achieve goal: " + string.Format("{0:n0}", Math.Round(finalizedCost[goal - 1]));

                    }


                }

else
                {
                     document.getElementById("results").innerHTML= "Error: attempted enchant level must be between 1 and 5";
                }
            }
            else
            {
                document.getElementById("results").innerHTML= "Error: input must be numeric!";
            }
        }



        function getRealProb(stacks,type)
        {
            var prob = 0.0;
            var realStacks = 0;
            //type 0 is +14 type 1 is DUO
            if (type == 0)
            {
                if (stacks > 25)
                {
                    realStacks = 25;
                }
                else
                {

                    realStacks = stacks;
                }
                prob = 0.025 + (0.005 * realStacks);

            }
            else if (type == 1)
            {

                if (stacks > 35)
                {
                    realStacks = 35;
                }
                else
                {
                    realStacks = stacks;
                }
                
		prob = 0.05 + (0.005 * realStacks);
            }

            return prob;

        }

        function useDuo(bstonecost, aSuperStoneCost,  currentstacks, bsCosts,  cProb)
        {

            var prob_duo = 0.0;
            var prob_norm = 0.0;
            var gearStacks = currentstacks;
            var duoStacks = currentstacks;
	    var answer= true;
            if (gearStacks > 25)
            {
                gearStacks = 25;
            }

            if (duoStacks > 35)
            {
                duoStacks = 35;
            }

            prob_duo = 0.05 + (0.005 * duoStacks);
            prob_norm = 0.025 + (0.005 * gearStacks);
            var opportunity_cost_duo = prob_duo * (bsCosts / cProb);
            var opportunity_cost_norm = prob_norm * (bsCosts / cProb);


            if (((opportunity_cost_duo  + aSuperStoneCost)/4) < (opportunity_cost_norm + bstonecost))
            {
		answer=true;
            }

            else
            {
		answer=false;
            }
	return answer;

        }

</script>