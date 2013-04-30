VISH.Quiz.TF = (function(V,$,undefined){
  
  var choices = {};

  var init = function(){
      _loadEvents();
  };

  var _loadEvents = function(){
  }

  var render = function(slide,template){
    var quizId = V.Utils.getId();
    var container = $("<div id='"+quizId+"' class='quizzContainer mcContainer' type='"+V.Constant.QZ_TYPE.TF+"'></div>");

    //Question
    var questionWrapper = $("<div class='mc_question_wrapper, mc_question_wrapper_viewer'></div>");
    $(questionWrapper).html(slide.question.wysiwygValue);
    $(container).append(questionWrapper);

    //Options
    var optionsWrapper = $("<table cellspacing='0' cellpadding='0' class='tf_options'></table>");
    choices[quizId] = [];

    //TF head
    var newTr = $("<tr class='mc_option tf_head'><td><img src='"+V.ImagesPath+ "quiz/checkbox_checked.png' class='tfCheckbox_viewer'/></td><td><img src='"+V.ImagesPath+ "quiz/checkbox_wrong.png' class='tfCheckbox_viewer'/></td><td></td><td></td></tr>");
    $(optionsWrapper).prepend(newTr);

    for(var i=0; i<slide.choices.length; i++){
      var option = slide.choices[i];
      var optionWrapper = $("<tr class='mc_option' nChoice='"+(i+1)+"'></tr>");
      var optionBox1 = $("<td><input class='tf_radio' type='radio' name='tf_radio"+i+"' column='true' value='"+index+"'/></td>");
      var optionBox2 = $("<td><input class='tf_radio' type='radio' name='tf_radio"+i+"' column='false' value='"+index+"'/></td>");
      var optionIndex = $("<td><span class='mc_option_index mc_option_index_viewer'>"+V.Quiz.MC.getChoicesLetters()[i]+"</span></td>");
      var optionText = $("<td><div class='mc_option_text mc_option_text_viewer'></div></td>");
      $(optionText).html(option.wysiwygValue);

      $(optionWrapper).append(optionBox1);
      $(optionWrapper).append(optionBox2);
      $(optionWrapper).append(optionIndex);
      $(optionWrapper).append(optionText);
      $(optionsWrapper).append(optionWrapper);

      choices[quizId].push(option);
    }

    $(container).append(optionsWrapper);

    var quizButtons = V.Quiz.renderButtons(slide.selfA);
    $(container).append(quizButtons);

    return V.Utils.getOuterHTML(container);
  };

  var onAnswerQuiz = function(quiz){
    var quizChoices = choices[$(quiz).attr("id")];
    $(quiz).find("tr.mc_option").not(".tf_head").each(function(index,tr){

      var trueRadio = $(tr).find("input[type='radio'][column='true']")[0];
      var falseRadio = $(tr).find("input[type='radio'][column='false']")[0];

      var myAnswer;
      if($(trueRadio).is(':checked')){
        myAnswer = true;
      } else if($(falseRadio).is(':checked')){
        myAnswer = false;
      } else {
        myAnswer = undefined;
      }

      var choice = quizChoices[index];
      var trChoice = $(quiz).find("tr.mc_option").not(".tf_head")[index];

      if(myAnswer===choice.answer){
        $(trChoice).addClass("mc_correct_choice");
      } else if(typeof myAnswer != "undefined"){
        $(trChoice).addClass("mc_wrong_choice");
      } else {
        //No mark, indicate correct answer
        if(choice.answer===true){
          $(trueRadio).attr('checked', true);
        } else if(choice.answer===false){
          $(falseRadio).attr('checked', true);
        }
      }
    });

    disableQuiz(quiz);
  }

  var getReport = function(quiz){
    var report = {};
    report.answers = [];
    report.empty = true;

    $(quiz).find("tr.mc_option").not(".tf_head").each(function(index,tr){
      var trueRadio = $(tr).find("input[type='radio'][column='true']")[0];
      var falseRadio = $(tr).find("input[type='radio'][column='false']")[0];

      if($(trueRadio).is(':checked')){
        report.answers.push({no: (index+1).toString(), answer: "true"});
        report.empty = false;
      } else if($(falseRadio).is(':checked')){
        report.answers.push({no: (index+1).toString(), answer: "false"});
        report.empty = false;
      } else {
        report.answers.push({no: (index+1).toString(), answer: "none"});
      }
    });

    return report;
  }

  var disableQuiz = function(quiz){
    $(quiz).find("input[type='radio']").attr("disabled","disabled");
    V.Quiz.disableAnswerButton(quiz);
  }


  /*
   * Data representation
   */

  var drawAnswers = function(quiz,answersList,options){
    var nAnswers = $(quiz).find("tr.mc_option[nChoice]").length;
    var labels = [];
    var dataTrue = [];
    var dataFalse = [];
    var maxValue = 0;
    var scaleSteps = 10;

    for(var i=0; i<nAnswers; i++){
      labels[i] = "V       " + V.Quiz.MC.getChoicesLetters()[i] + "       F";
      dataTrue[i] = 0;
      dataFalse[i] = 0;
    }

    var alL = answersList.length;
    for(var j=0; j<alL; j++){
      //List of answers of a user
      var answers = answersList[j];

      var aL = answers.length;
      for(var k=0; k<aL; k++){
        var answer = answers[k];
        var index = answer.no-1;
        if(answer.answer==="true"){
          dataTrue[index]++;
        } else {
          dataFalse[index]++;
        }
      } 
    }

    for(var l=0; l<nAnswers; l++){
      if(dataTrue[i] > maxValue){
        maxValue = dataTrue[i];
      }
      if(dataFalse[i] > maxValue){
        maxValue = dataFalse[i];
      }
    }

    if(maxValue<10){
      scaleSteps = Math.max(1,maxValue);
    }

    var canvas = $("#quiz_chart");
    var ctx = $(canvas).get(0).getContext("2d");
    var data = {
        labels : labels,
        datasets : [
            {
                fillColor : "#E2FFE3",
                strokeColor : "rgba(220,220,220,1)",
                data : dataTrue
            },
            {
                fillColor : "#FFE2E2",
                strokeColor : "rgba(220,220,220,1)",
                data : dataFalse
            }
        ]
    };

    var animation = false;
    if((options)&&(options.first===true)){
      animation = true;
    }

    var options = {
      animation: animation,
      scaleOverride: true,
      scaleStepWidth: Math.max(1,Math.ceil(maxValue/10)),
      scaleSteps: scaleSteps,
      showTooltips: false
    }
    var myNewChart = new Chart(ctx).Bar(data,options);
  }

  return {
    init          : init,
    render        : render,
    onAnswerQuiz  : onAnswerQuiz,
    getReport     : getReport,
    disableQuiz   : disableQuiz,
    drawAnswers   : drawAnswers
  };
    
}) (VISH, jQuery);

 